// @format

import * as vscode from 'vscode';
import { Tab, createTab, DiagnosticStatus } from '../models/tab';
import { getDisambiguatedName } from '../utils/pathUtils';

const LOG_PREFIX = '[SideTabs.TabSyncService]';

interface IPersistenceService {
	getTabSortOrder(id: string): number | undefined;
	getTabGroupId(id: string): string | null;
}

/**
 * Service to synchronize VS Code tabs with our internal tab list
 */
export class TabSyncService {
	private tabs: Map<string, Tab> = new Map();
	private readonly _onDidChangeTabs = new vscode.EventEmitter<Tab[]>();
	public readonly onDidChangeTabs = this._onDidChangeTabs.event;
	private persistenceService?: IPersistenceService;

	constructor() {
		try {
			this.syncTabs();
			console.log(`${LOG_PREFIX} Initialized with ${this.tabs.size} tabs`);
		} catch (error) {
			console.error(`${LOG_PREFIX} Error during initialization:`, error);
		}
	}

	/**
	 * Set persistence service for restoring state
	 */
	setPersistenceService(persistenceService: IPersistenceService): void {
		this.persistenceService = persistenceService;
		console.log(`${LOG_PREFIX} Persistence service connected`);
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
		try {
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
						
						// Restore from persistence if available
						let sortOrder = existingTab?.sortOrder ?? 0;
						let groupId = existingTab?.groupId ?? null;
						
						if (this.persistenceService) {
							// Always prefer persistence service as the source of truth for layout
							try {
								const persistedSortOrder = this.persistenceService.getTabSortOrder(id);
								const persistedGroupId = this.persistenceService.getTabGroupId(id);
								
								// Only use persisted values if they exist (though the service returns defaults)
								// For sortOrder, 0 is the default, so we can just use it
								sortOrder = persistedSortOrder ?? 0;
								groupId = persistedGroupId;
							} catch (err) {
								console.warn(`${LOG_PREFIX} Failed to restore persistence for ${id}:`, err);
							}
						}
						
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
			console.log(`${LOG_PREFIX} Synced ${newTabs.size} tabs`);
		} catch (error) {
			console.error(`${LOG_PREFIX} Error during syncTabs:`, error);
		}
	}

	/**
	 * Update diagnostic statuses for all tabs
	 */
	updateDiagnostics(
		diagnosticStatusMap: Map<string, DiagnosticStatus>
	): void {
		try {
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
				console.log(`${LOG_PREFIX} Updated diagnostics for tabs`);
			}
		} catch (error) {
			console.error(`${LOG_PREFIX} Error updating diagnostics:`, error);
		}
	}

	/**
	 * Update isDirty status for a specific tab
	 */
	updateTabDirtyStatus(uri: vscode.Uri, isDirty: boolean): void {
		try {
			const id = uri.toString();
			const tab = this.tabs.get(id);

			if (tab && tab.isDirty !== isDirty) {
				tab.isDirty = isDirty;
				this._onDidChangeTabs.fire(this.getTabs());
			}
		} catch (error) {
			console.error(`${LOG_PREFIX} Error updating tab dirty status:`, error);
		}
	}

	/**
	 * Update a tab's properties
	 */
	updateTab(id: string, updates: Partial<Tab>): void {
		try {
			const tab = this.tabs.get(id);
			if (tab) {
				this.tabs.set(id, { ...tab, ...updates });
				this._onDidChangeTabs.fire(this.getTabs());
			}
		} catch (error) {
			console.error(`${LOG_PREFIX} Error updating tab:`, error);
		}
	}

	/**
	 * Update all tabs' display names (useful after tab changes)
	 */
	updateDisplayNames(): void {
		try {
			const allUris = Array.from(this.tabs.values()).map((tab) => tab.uri);

			for (const tab of this.tabs.values()) {
				const newDisplayName = getDisambiguatedName(tab.uri, allUris);
				if (newDisplayName !== tab.displayName) {
					tab.displayName = newDisplayName;
				}
			}

			this._onDidChangeTabs.fire(this.getTabs());
			console.log(`${LOG_PREFIX} Updated display names for ${this.tabs.size} tabs`);
		} catch (error) {
			console.error(`${LOG_PREFIX} Error updating display names:`, error);
		}
	}

	/**
	 * Dispose of resources
	 */
	dispose(): void {
		this._onDidChangeTabs.dispose();
		console.log(`${LOG_PREFIX} Disposed`);
	}
}
