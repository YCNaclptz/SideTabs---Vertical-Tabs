// @format

import * as vscode from 'vscode';
import { TabTreeProvider } from './providers/tabTreeProvider';
import { TabSyncService } from './services/tabSyncService';
import { DiagnosticService } from './services/diagnosticService';
import { TabDecorationProvider } from './providers/tabDecorationProvider';
import { registerCommands } from './commands';
import { VIEWS } from './utils/constants';

/**
 * Extension activation entry point
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('SideTabs extension is now active');

	// Initialize services
	const tabSyncService = new TabSyncService();
	const diagnosticService = new DiagnosticService();
	const tabTreeProvider = new TabTreeProvider();
	const decorationProvider = new TabDecorationProvider();

	// Set initial tabs
	tabTreeProvider.setTabs(tabSyncService.getTabs());

	// Register file decoration provider
	vscode.window.registerFileDecorationProvider(decorationProvider);

	// Create tree view
	const treeView = vscode.window.createTreeView(VIEWS.VERTICAL_TABS, {
		treeDataProvider: tabTreeProvider,
		showCollapseAll: true,
		canSelectMany: false,
	});

	// Listen to tab changes from VS Code
	const tabChangeListener = vscode.window.tabGroups.onDidChangeTabs(() => {
		tabSyncService.syncTabs();
	});

	// Listen to our service's tab changes and update the tree view
	const syncListener = tabSyncService.onDidChangeTabs((tabs) => {
		tabTreeProvider.setTabs(tabs);
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

	// Listen to configuration changes
	const configListener = vscode.workspace.onDidChangeConfiguration(
		(event) => {
			if (
				event.affectsConfiguration('sideTabs.errorColor') ||
				event.affectsConfiguration('sideTabs.warningColor')
			) {
				decorationProvider.updateConfiguration();
			}
		}
	);

	// Register commands
	registerCommands(context);

	// Register all disposables
	context.subscriptions.push(
		treeView,
		tabSyncService,
		diagnosticService,
		tabTreeProvider,
		decorationProvider,
		tabChangeListener,
		syncListener,
		diagnosticListener,
		textDocChangeListener,
		saveListener,
		configListener
	);

	console.log('SideTabs: All services initialized and listeners attached');
}

/**
 * Extension deactivation
 */
export function deactivate() {
	console.log('SideTabs extension is being deactivated');
}
