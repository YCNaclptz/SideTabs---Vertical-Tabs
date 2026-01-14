// @format

import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Service for file-related operations
 */
export class FileService {
	/**
	 * Reveal file in file explorer
	 */
	static async revealInExplorer(uri: vscode.Uri): Promise<void> {
		try {
			await vscode.commands.executeCommand(
				'revealFileInOS',
				uri
			);
		} catch (error) {
			vscode.window.showErrorMessage(
				`Failed to reveal file in explorer: ${error}`
			);
		}
	}

	/**
	 * Copy full file path to clipboard
	 */
	static async copyPath(uri: vscode.Uri): Promise<void> {
		try {
			const fullPath = uri.fsPath;
			await vscode.env.clipboard.writeText(fullPath);
			vscode.window.showInformationMessage('Path copied to clipboard');
		} catch (error) {
			vscode.window.showErrorMessage(
				`Failed to copy path: ${error}`
			);
		}
	}

	/**
	 * Copy relative path to clipboard
	 */
	static async copyRelativePath(uri: vscode.Uri): Promise<void> {
		try {
			const workspaceFolders = vscode.workspace.workspaceFolders;
			
			if (!workspaceFolders || workspaceFolders.length === 0) {
				// No workspace, use file name
				const fileName = path.basename(uri.fsPath);
				await vscode.env.clipboard.writeText(fileName);
				vscode.window.showInformationMessage(
					'File name copied to clipboard'
				);
				return;
			}

			// Find the workspace folder containing this file
			let relativeToWorkspace = uri.fsPath;
			for (const folder of workspaceFolders) {
				if (uri.fsPath.startsWith(folder.uri.fsPath)) {
					relativeToWorkspace = path.relative(
						folder.uri.fsPath,
						uri.fsPath
					);
					break;
				}
			}

			await vscode.env.clipboard.writeText(relativeToWorkspace);
			vscode.window.showInformationMessage(
				'Relative path copied to clipboard'
			);
		} catch (error) {
			vscode.window.showErrorMessage(
				`Failed to copy relative path: ${error}`
			);
		}
	}
}
