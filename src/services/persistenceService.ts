// @format

import * as vscode from 'vscode';
import { TabState, createEmptyTabState, isValidTabState, migrateTabState } from '../models/tabState';
import { TabGroup } from '../models/tabGroup';
import { STORAGE_KEYS, STATE_VERSION } from '../utils/constants';

/**
 * Service for persisting tab state to workspace storage
 */
export class PersistenceService {
	private state: TabState;

	constructor(private readonly context: vscode.ExtensionContext) {
		this.state = this.loadState();
	}

	/**
	 * Load state from workspace storage
	 */
	private loadState(): TabState {
		const stateJson = this.context.workspaceState.get<string>(
			STORAGE_KEYS.TAB_STATE
		);

		if (!stateJson) {
			return createEmptyTabState(STATE_VERSION);
		}

		try {
			const state = JSON.parse(stateJson);
			if (isValidTabState(state)) {
				return migrateTabState(state, STATE_VERSION);
			}
		} catch (error) {
			console.error('Failed to parse tab state:', error);
		}

		return createEmptyTabState(STATE_VERSION);
	}

	/**
	 * Save state to workspace storage
	 */
	private async saveState(): Promise<void> {
		this.state.lastUpdated = Date.now();
		const stateJson = JSON.stringify(this.state);
		await this.context.workspaceState.update(
			STORAGE_KEYS.TAB_STATE,
			stateJson
		);
	}

	/**
	 * Get the current state
	 */
	getState(): TabState {
		return { ...this.state };
	}

	/**
	 * Get all groups
	 */
	getGroups(): TabGroup[] {
		return [...this.state.groups];
	}

	/**
	 * Get group by ID
	 */
	getGroup(groupId: string): TabGroup | undefined {
		return this.state.groups.find((g) => g.id === groupId);
	}

	/**
	 * Add a new group
	 */
	async addGroup(group: TabGroup): Promise<void> {
		this.state.groups.push(group);
		this.state.groupSortOrder[group.id] = group.sortOrder;
		await this.saveState();
	}

	/**
	 * Update an existing group
	 */
	async updateGroup(groupId: string, updates: Partial<TabGroup>): Promise<void> {
		const index = this.state.groups.findIndex((g) => g.id === groupId);
		if (index !== -1) {
			this.state.groups[index] = { ...this.state.groups[index], ...updates };
			if (updates.sortOrder !== undefined) {
				this.state.groupSortOrder[groupId] = updates.sortOrder;
			}
			await this.saveState();
		}
	}

	/**
	 * Delete a group
	 */
	async deleteGroup(groupId: string): Promise<void> {
		this.state.groups = this.state.groups.filter((g) => g.id !== groupId);
		delete this.state.groupSortOrder[groupId];

		// Remove all tab assignments to this group
		for (const tabId in this.state.tabGroupAssignments) {
			if (this.state.tabGroupAssignments[tabId] === groupId) {
				delete this.state.tabGroupAssignments[tabId];
			}
		}

		await this.saveState();
	}

	/**
	 * Assign a tab to a group
	 */
	async assignTabToGroup(tabId: string, groupId: string | null): Promise<void> {
		const oldGroupId = this.state.tabGroupAssignments[tabId];
		
		if (groupId === null) {
			delete this.state.tabGroupAssignments[tabId];
		} else {
			this.state.tabGroupAssignments[tabId] = groupId;
		}
		
		await this.saveState();
		
		// Auto-delete empty group if the old group now has no tabs
		if (oldGroupId && oldGroupId !== groupId) {
			await this.deleteGroupIfEmpty(oldGroupId);
		}
	}

	/**
	 * Get group ID for a tab
	 */
	getTabGroupId(tabId: string): string | null {
		return this.state.tabGroupAssignments[tabId] || null;
	}

	/**
	 * Set custom sort order for a tab
	 */
	async setTabSortOrder(tabId: string, sortOrder: number): Promise<void> {
		this.state.customSortOrder[tabId] = sortOrder;
		await this.saveState();
	}

	/**
	 * Get custom sort order for a tab
	 */
	getTabSortOrder(tabId: string): number {
		return this.state.customSortOrder[tabId] ?? 0;
	}

	/**
	 * Set sort order for a group
	 */
	async setGroupSortOrder(groupId: string, sortOrder: number): Promise<void> {
		this.state.groupSortOrder[groupId] = sortOrder;
		const group = this.state.groups.find((g) => g.id === groupId);
		if (group) {
			group.sortOrder = sortOrder;
		}
		await this.saveState();
	}

	/**
	 * Get sort order for a group
	 */
	getGroupSortOrder(groupId: string): number {
		return this.state.groupSortOrder[groupId] ?? 0;
	}

	/**
	 * Remove tab from all tracking (when tab is closed)
	 */
	async removeTab(tabId: string): Promise<void> {
		const oldGroupId = this.state.tabGroupAssignments[tabId];
		
		delete this.state.tabGroupAssignments[tabId];
		delete this.state.customSortOrder[tabId];
		await this.saveState();
		
		// Auto-delete empty group if it now has no tabs
		if (oldGroupId) {
			await this.deleteGroupIfEmpty(oldGroupId);
		}
	}

	/**
	 * Delete a group if it has no tabs
	 */
	private async deleteGroupIfEmpty(groupId: string): Promise<void> {
		const hasTabsInGroup = Object.values(this.state.tabGroupAssignments).some(
			(gid) => gid === groupId
		);

		if (!hasTabsInGroup) {
			this.state.groups = this.state.groups.filter((g) => g.id !== groupId);
			delete this.state.groupSortOrder[groupId];
			await this.saveState();
		}
	}

	/**
	 * Clear all state (for testing/debugging)
	 */
	async clearState(): Promise<void> {
		this.state = createEmptyTabState(STATE_VERSION);
		await this.saveState();
	}
}
