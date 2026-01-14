// @format

import * as vscode from 'vscode';
import { DiagnosticStatus } from '../models/tab';
import { SettingsService, AllSettings } from '../services/settingsService';

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
	private settings: AllSettings;

	constructor(private readonly settingsService: SettingsService) {
		this.settings = settingsService.getAllSettings();
		this.setupConfigurationListener();
	}

	/**
	 * Setup listener for configuration changes
	 */
	private setupConfigurationListener(): void {
		this.settingsService.onDidChangeSettings((_changes) => {
			this.settings = this.settingsService.getAllSettings();
			this.refresh();
		});
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
