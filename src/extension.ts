// @format

import * as vscode from 'vscode';
import { TabTreeProvider } from './providers/tabTreeProvider';
import { TabSyncService } from './services/tabSyncService';
import { DiagnosticService } from './services/diagnosticService';
import { SettingsService } from './services/settingsService';
import { TabDecorationProvider } from './providers/tabDecorationProvider';
import { PersistenceService } from './services/persistenceService';
import { TabDragAndDropController } from './providers/tabDragAndDropController';
import { registerCommands } from './commands';
import { VIEWS } from './utils/constants';

/**
 * Extension activation entry point
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('SideTabs extension is now active');

	// Initialize services
	const persistenceService = new PersistenceService(context);
	const settingsService = new SettingsService(context);
	const tabSyncService = new TabSyncService();
	const diagnosticService = new DiagnosticService();
	const tabTreeProvider = new TabTreeProvider();
	const decorationProvider = new TabDecorationProvider(settingsService);
	const dragAndDropController = new TabDragAndDropController(
		persistenceService,
		tabSyncService
	);

	// Connect services
	tabSyncService.setPersistenceService(persistenceService);

	// Connect services
	tabSyncService.setPersistenceService(persistenceService);

	// Restore tab order from persistence
	restoreTabOrder(tabSyncService, persistenceService);

	// Set initial tabs and groups
	tabTreeProvider.setTabs(tabSyncService.getTabs());
	tabTreeProvider.setGroups(persistenceService.getGroups());

	// Register file decoration provider
	vscode.window.registerFileDecorationProvider(decorationProvider);

	// Create tree view with drag and drop support
	const treeView = vscode.window.createTreeView(VIEWS.VERTICAL_TABS, {
		treeDataProvider: tabTreeProvider,
		showCollapseAll: true,
		canSelectMany: false,
		dragAndDropController: dragAndDropController,
	});

	// Listen to tab changes from VS Code
	const tabChangeListener = vscode.window.tabGroups.onDidChangeTabs(() => {
		tabSyncService.syncTabs();
	});

	// Listen to our service's tab changes and update the tree view
	const syncListener = tabSyncService.onDidChangeTabs((tabs) => {
		tabTreeProvider.setTabs(tabs);
		tabTreeProvider.setGroups(persistenceService.getGroups());
		tabTreeProvider.refresh();
	});

	// Listen to diagnostic changes
	const diagnosticListener = diagnosticService.onDidChangeDiagnostics(
		(statusMap) => {
			tabSyncService.updateDiagnostics(statusMap);
			decorationProvider.updateDiagnostics(statusMap);
		}
	);

	// Listen to text document changes for isDirty tracking
	const textDocChangeListener = vscode.workspace.onDidChangeTextDocument(
		(event) => {
			tabSyncService.updateTabDirtyStatus(
				event.document.uri,
				event.document.isDirty
			);
		}
	);

	// Listen to document save events
	const saveListener = vscode.workspace.onDidSaveTextDocument((document) => {
		tabSyncService.updateTabDirtyStatus(document.uri, false);
	});

	// Register commands
	registerCommands(context, persistenceService, tabTreeProvider);

	// Listen to tab closures to clean up persistence
	const tabCloseListener = vscode.window.tabGroups.onDidChangeTabs(
		async (event) => {
			// Clean up persistence for closed tabs
			for (const closedTab of event.closed) {
				if (closedTab.input instanceof vscode.TabInputText) {
					const tabId = closedTab.input.uri.toString();
					await persistenceService.removeTab(tabId);
				}
			}
		}
	);

	// Register all disposables
	context.subscriptions.push(
		treeView,
		tabSyncService,
		diagnosticService,
		settingsService,
		tabTreeProvider,
		decorationProvider,
		tabChangeListener,
		syncListener,
		diagnosticListener,
		textDocChangeListener,
		saveListener,
		tabCloseListener
	);

	console.log('SideTabs: All services initialized and listeners attached');
}

/**
 * Restore tab order and group assignments from persistent storage
 */
function restoreTabOrder(
	tabSyncService: TabSyncService,
	persistenceService: PersistenceService
): void {
	const tabs = tabSyncService.getTabs();

	// Restore sort order and group assignments for each tab
	for (const tab of tabs) {
		const sortOrder = persistenceService.getTabSortOrder(tab.id);
		const groupId = persistenceService.getTabGroupId(tab.id);

		if (sortOrder !== undefined || groupId !== null) {
			tabSyncService.updateTab(tab.id, {
				sortOrder: sortOrder || 0,
				groupId: groupId || null,
			});
		}
	}

	console.log('SideTabs: Tab order and groups restored from persistence');
}

/**
 * Extension deactivation
 */
export function deactivate() {
	console.log('SideTabs extension is being deactivated');
}
