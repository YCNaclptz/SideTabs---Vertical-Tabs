// @format

import * as vscode from 'vscode';
import { DiagnosticStatus } from '../models/tab';
import { CONFIG_KEYS, DEFAULTS } from '../utils/constants';

/**
 * File decoration provider for error/warning colors
 */
export class TabDecorationProvider
	implements vscode.FileDecorationProvider
{
	private readonly _onDidChangeFileDecorations =
		new vscode.EventEmitter<vscode.Uri | vscode.Uri[]>();
	readonly onDidChangeFileDecorations =
		this._onDidChangeFileDecorations.event;

	private diagnosticStatusMap: Map<string, DiagnosticStatus> = new Map();
	private errorColor: string = DEFAULTS.ERROR_COLOR;
	private warningColor: string = DEFAULTS.WARNING_COLOR;

	constructor() {
		this.loadConfiguration();
	}

	/**
	 * Load configuration values
	 */
	private loadConfiguration(): void {
		const config = vscode.workspace.getConfiguration();
		this.errorColor =
			config.get<string>(CONFIG_KEYS.ERROR_COLOR) || DEFAULTS.ERROR_COLOR;
		this.warningColor =
			config.get<string>(CONFIG_KEYS.WARNING_COLOR) || DEFAULTS.WARNING_COLOR;
	}

	/**
	 * Update configuration (called when settings change)
	 */
	updateConfiguration(): void {
		this.loadConfiguration();
		this.refresh();
	}

	/**
	 * Update diagnostic statuses
	 */
	updateDiagnostics(statusMap: Map<string, DiagnosticStatus>): void {
		this.diagnosticStatusMap = new Map(statusMap);
		this.refresh();
	}

	/**
	 * Provide decoration for a file
	 */
	provideFileDecoration(
		uri: vscode.Uri
	): vscode.FileDecoration | undefined {
		const status = this.diagnosticStatusMap.get(uri.toString());

		if (!status || status === DiagnosticStatus.None) {
			return undefined;
		}

		if (status === DiagnosticStatus.Error) {
			return {
				badge: '●',
				color: new vscode.ThemeColor('errorForeground'),
				tooltip: 'Contains errors',
			};
		}

		if (status === DiagnosticStatus.Warning) {
			return {
				badge: '●',
				color: new vscode.ThemeColor('editorWarning.foreground'),
				tooltip: 'Contains warnings',
			};
		}

		return undefined;
	}

	/**
	 * Refresh all decorations
	 */
	refresh(): void {
		const uris = Array.from(this.diagnosticStatusMap.keys()).map((id) =>
			vscode.Uri.parse(id)
		);
		if (uris.length > 0) {
			this._onDidChangeFileDecorations.fire(uris);
		}
	}

	/**
	 * Dispose of resources
	 */
	dispose(): void {
		this._onDidChangeFileDecorations.dispose();
	}
}
