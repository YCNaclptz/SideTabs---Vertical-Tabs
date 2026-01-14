// @format

import * as vscode from 'vscode';
import { COMMANDS } from '../utils/constants';
import { PersistenceService } from '../services/persistenceService';
import { TabTreeProvider } from '../providers/tabTreeProvider';
import { createTabGroup, isValidGroupName } from '../models/tabGroup';
import { TabTreeItem, isGroupItem, isTabItem } from '../models/treeItems';
import { FileService } from '../services/fileService';

/**
 * Register the sideTabs.openTab command
 * Note: Most tab opening is handled by TreeItem.command directly
 * This is for programmatic opening if needed
 */
export function registerOpenTabCommand(
	context: vscode.ExtensionContext
): void {
	const disposable = vscode.commands.registerCommand(
		COMMANDS.OPEN_TAB,
		async (uri: vscode.Uri) => {
			if (uri) {
				await vscode.window.showTextDocument(uri, {
					preview: false,
					preserveFocus: false,
				});
			}
		}
	);

	context.subscriptions.push(disposable);
}

/**
 * Register file operation commands
 */
export function registerFileCommands(
	context: vscode.ExtensionContext
): void {
	// Close tab command
	context.subscriptions.push(
		vscode.commands.registerCommand(
			COMMANDS.CLOSE_TAB,
			async (item: TabTreeItem) => {
				if (!isTabItem(item)) {
					return;
				}

				const tab = item.tab;
				// Find the tab in the editor group and close it
				for (const group of vscode.window.tabGroups.all) {
					const vsTab = group.tabs.find(
						(t) =>
							t.input instanceof vscode.TabInputText &&
							t.input.uri.toString() === tab.id
					);
					if (vsTab) {
						await vscode.window.tabGroups.close(vsTab);
						break;
					}
				}
			}
		)
	);

	// Reveal in explorer command
	context.subscriptions.push(
		vscode.commands.registerCommand(
			COMMANDS.REVEAL_IN_EXPLORER,
			async (item: TabTreeItem) => {
				if (!isTabItem(item)) {
					return;
				}

				await FileService.revealInExplorer(item.tab.uri);
			}
		)
	);

	// Copy path command
	context.subscriptions.push(
		vscode.commands.registerCommand(
			COMMANDS.COPY_PATH,
			async (item: TabTreeItem) => {
				if (!isTabItem(item)) {
					return;
				}

				await FileService.copyPath(item.tab.uri);
			}
		)
	);

	// Copy relative path command
	context.subscriptions.push(
		vscode.commands.registerCommand(
			COMMANDS.COPY_RELATIVE_PATH,
			async (item: TabTreeItem) => {
				if (!isTabItem(item)) {
					return;
				}

				await FileService.copyRelativePath(item.tab.uri);
			}
		)
	);
}

/**
 * Register group management commands
 */
export function registerGroupCommands(
	context: vscode.ExtensionContext,
	persistenceService: PersistenceService,
	treeProvider: TabTreeProvider
): void {
	// Create new group
	context.subscriptions.push(
		vscode.commands.registerCommand(COMMANDS.CREATE_GROUP, async () => {
			const name = await vscode.window.showInputBox({
				prompt: 'Enter group name',
				placeHolder: 'My Group',
				validateInput: (value) => {
					if (!isValidGroupName(value)) {
						return 'Group name must be 1-50 characters';
					}
					return undefined;
				},
			});

			if (name) {
				const groups = persistenceService.getGroups();
				const maxSortOrder = Math.max(0, ...groups.map((g) => g.sortOrder));
				const newGroup = createTabGroup(name, maxSortOrder + 1);
				await persistenceService.addGroup(newGroup);
				
				// Update tree view
				treeProvider.setGroups(persistenceService.getGroups());
				treeProvider.refresh();
				
				vscode.window.showInformationMessage(`Group "${name}" created`);
			}
		})
	);

	// Rename group
	context.subscriptions.push(
		vscode.commands.registerCommand(
			COMMANDS.RENAME_GROUP,
			async (item: TabTreeItem) => {
				if (!isGroupItem(item)) {
					return;
				}

				const newName = await vscode.window.showInputBox({
					prompt: 'Enter new group name',
					value: item.group.name,
					validateInput: (value) => {
						if (!isValidGroupName(value)) {
							return 'Group name must be 1-50 characters';
						}
						return undefined;
					},
				});

				if (newName && newName !== item.group.name) {
					await persistenceService.updateGroup(item.group.id, {
						name: newName,
					});
					
					// Update tree view
					treeProvider.setGroups(persistenceService.getGroups());
					treeProvider.refresh();
					
					vscode.window.showInformationMessage(
						`Group renamed to "${newName}"`
					);
				}
			}
		)
	);

	// Delete group
	context.subscriptions.push(
		vscode.commands.registerCommand(
			COMMANDS.DELETE_GROUP,
			async (item: TabTreeItem) => {
				if (!isGroupItem(item)) {
					return;
				}

				const confirm = await vscode.window.showWarningMessage(
					`Delete group "${item.group.name}"? Tabs will be moved to ungrouped.`,
					{ modal: true },
					'Delete'
				);

				if (confirm === 'Delete') {
					await persistenceService.deleteGroup(item.group.id);
					
					// Update tree view
					treeProvider.setGroups(persistenceService.getGroups());
					treeProvider.refresh();
					
					vscode.window.showInformationMessage(
						`Group "${item.group.name}" deleted`
					);
				}
			}
		)
	);

	// Toggle group collapse
	context.subscriptions.push(
		vscode.commands.registerCommand(
			COMMANDS.TOGGLE_GROUP_COLLAPSE,
			async (item: TabTreeItem) => {
				if (!isGroupItem(item)) {
					return;
				}

				await persistenceService.updateGroup(item.group.id, {
					isCollapsed: !item.group.isCollapsed,
				});
				
				// Update tree view
				treeProvider.setGroups(persistenceService.getGroups());
				treeProvider.refresh();
			}
		)
	);
}

/**
 * Register all commands
 */
export function registerCommands(
	context: vscode.ExtensionContext,
	persistenceService?: PersistenceService,
	treeProvider?: TabTreeProvider
): void {
	registerOpenTabCommand(context);
	registerFileCommands(context);

	if (persistenceService && treeProvider) {
		registerGroupCommands(context, persistenceService, treeProvider);
	}
}
