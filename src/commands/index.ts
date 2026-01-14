// @format

import * as vscode from 'vscode';
import { COMMANDS } from '../utils/constants';

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
 * Register all commands
 * This will be expanded in later phases
 */
export function registerCommands(context: vscode.ExtensionContext): void {
	registerOpenTabCommand(context);

	// More commands will be added in later phases:
	// - Phase 4: US2 commands
	// - Phase 5: US3 commands
	// - Phase 6: US4 group commands
	// - Phase 8: US6 file path commands
}
