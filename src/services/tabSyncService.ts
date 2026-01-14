// @format

import * as vscode from 'vscode';
import { Tab, createTab, DiagnosticStatus } from '../models/tab';
import { getDisambiguatedName } from '../utils/pathUtils';

/**
 * Service to synchronize VS Code tabs with our internal tab list
 */
export class TabSyncService {
	private tabs: Map<string, Tab> = new Map();
	private readonly _onDidChangeTabs = new vscode.EventEmitter<Tab[]>();
	public readonly onDidChangeTabs = this._onDidChangeTabs.event;

	constructor() {
		this.syncTabs();
	}

	/**
	 * Get all current tabs
	 */
	getTabs(): Tab[] {
		return Array.from(this.tabs.values());
	}

	/**
	 * Get a specific tab by ID
	 */
	getTab(id: string): Tab | undefined {
		return this.tabs.get(id);
	}

	/**
	 * Sync tabs from VS Code's tab groups
	 */
	syncTabs(): void {
		const newTabs = new Map<string, Tab>();
		const allUris: vscode.Uri[] = [];

		// First pass: collect all URIs for disambiguation
		for (const group of vscode.window.tabGroups.all) {
			for (const tab of group.tabs) {
				if (tab.input instanceof vscode.TabInputText) {
					allUris.push(tab.input.uri);
				}
			}
		}

		// Second pass: create tabs with disambiguated names
		for (const group of vscode.window.tabGroups.all) {
			for (const tab of group.tabs) {
				if (tab.input instanceof vscode.TabInputText) {
					const uri = tab.input.uri;
					const id = uri.toString();
					const displayName = getDisambiguatedName(uri, allUris);

					// Preserve existing tab data if available
					const existingTab = this.tabs.get(id);
					const sortOrder = existingTab?.sortOrder ?? 0;
					const groupId = existingTab?.groupId ?? null;
					const diagnosticStatus =
						existingTab?.diagnosticStatus ?? DiagnosticStatus.None;

					const newTab = createTab(
						tab,
						group.viewColumn,
						displayName,
						sortOrder,
						groupId,
						diagnosticStatus
					);

					if (newTab) {
						newTabs.set(id, newTab);
					}
				}
			}
		}

		this.tabs = newTabs;
		this._onDidChangeTabs.fire(this.getTabs());
	}

	/**
	 * Update diagnostic statuses for all tabs
	 */
	updateDiagnostics(
		diagnosticStatusMap: Map<string, DiagnosticStatus>
	): void {
		let hasChanges = false;

		for (const tab of this.tabs.values()) {
			const newStatus =
				diagnosticStatusMap.get(tab.id) || DiagnosticStatus.None;
			if (tab.diagnosticStatus !== newStatus) {
				tab.diagnosticStatus = newStatus;
				hasChanges = true;
			}
		}

		if (hasChanges) {
			this._onDidChangeTabs.fire(this.getTabs());
		}
	}

	/**
	 * Update isDirty status for a specific tab
	 */
	updateTabDirtyStatus(uri: vscode.Uri, isDirty: boolean): void {
		const id = uri.toString();
		const tab = this.tabs.get(id);

		if (tab && tab.isDirty !== isDirty) {
			tab.isDirty = isDirty;
			this._onDidChangeTabs.fire(this.getTabs());
		}
	}

	/**
	 * Update a tab's properties
	 */
	updateTab(id: string, updates: Partial<Tab>): void {
		const tab = this.tabs.get(id);
		if (tab) {
			this.tabs.set(id, { ...tab, ...updates });
			this._onDidChangeTabs.fire(this.getTabs());
		}
	}

	/**
	 * Update all tabs' display names (useful after tab changes)
	 */
	updateDisplayNames(): void {
		const allUris = Array.from(this.tabs.values()).map((tab) => tab.uri);

		for (const tab of this.tabs.values()) {
			const newDisplayName = getDisambiguatedName(tab.uri, allUris);
			if (newDisplayName !== tab.displayName) {
				tab.displayName = newDisplayName;
			}
		}

		this._onDidChangeTabs.fire(this.getTabs());
	}

	/**
	 * Dispose of resources
	 */
	dispose(): void {
		this._onDidChangeTabs.dispose();
	}
}
