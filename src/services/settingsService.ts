// @format

import * as vscode from 'vscode';
import { CONFIG_KEYS, DEFAULTS } from '../utils/constants';

/**
 * Service to manage and listen to VS Code settings
 */
export class SettingsService {
	private readonly _onDidChangeSettings =
		new vscode.EventEmitter<SettingsChangeEvent>();
	readonly onDidChangeSettings = this._onDidChangeSettings.event;

	constructor(private readonly context: vscode.ExtensionContext) {
		this.setupConfigurationListener();
	}

	/**
	 * Setup listener for configuration changes
	 */
	private setupConfigurationListener(): void {
		const listener = vscode.workspace.onDidChangeConfiguration((event) => {
			const changes: Partial<SettingsChangeEvent> = {};
			let hasChanges = false;

			if (event.affectsConfiguration(CONFIG_KEYS.FONT_SIZE)) {
				changes.fontSize = this.getFontSize();
				hasChanges = true;
			}
			if (event.affectsConfiguration(CONFIG_KEYS.ERROR_COLOR)) {
				changes.errorColor = this.getErrorColor();
				hasChanges = true;
			}
			if (event.affectsConfiguration(CONFIG_KEYS.WARNING_COLOR)) {
				changes.warningColor = this.getWarningColor();
				hasChanges = true;
			}
			if (event.affectsConfiguration(CONFIG_KEYS.SHOW_FILE_ICONS)) {
				changes.showFileIcons = this.getShowFileIcons();
				hasChanges = true;
			}
			if (event.affectsConfiguration(CONFIG_KEYS.MAX_FILE_NAME_LENGTH)) {
				changes.maxFileNameLength = this.getMaxFileNameLength();
				hasChanges = true;
			}
			if (event.affectsConfiguration(CONFIG_KEYS.SORT_MODE)) {
				changes.sortMode = this.getSortMode();
				hasChanges = true;
			}

			if (hasChanges) {
				this._onDidChangeSettings.fire(changes as SettingsChangeEvent);
			}
		});

		this.context.subscriptions.push(listener);
	}

	/**
	 * Get font size setting
	 */
	getFontSize(): number {
		const config = vscode.workspace.getConfiguration();
		return (
			config.get<number>(CONFIG_KEYS.FONT_SIZE) ?? DEFAULTS.FONT_SIZE
		);
	}

	/**
	 * Get error color setting
	 */
	getErrorColor(): string {
		const config = vscode.workspace.getConfiguration();
		return (
			config.get<string>(CONFIG_KEYS.ERROR_COLOR) ??
			DEFAULTS.ERROR_COLOR
		);
	}

	/**
	 * Get warning color setting
	 */
	getWarningColor(): string {
		const config = vscode.workspace.getConfiguration();
		return (
			config.get<string>(CONFIG_KEYS.WARNING_COLOR) ??
			DEFAULTS.WARNING_COLOR
		);
	}

	/**
	 * Get show file icons setting
	 */
	getShowFileIcons(): boolean {
		const config = vscode.workspace.getConfiguration();
		return (
			config.get<boolean>(CONFIG_KEYS.SHOW_FILE_ICONS) ??
			DEFAULTS.SHOW_FILE_ICONS
		);
	}

	/**
	 * Get max file name length setting
	 */
	getMaxFileNameLength(): number {
		const config = vscode.workspace.getConfiguration();
		return (
			config.get<number>(CONFIG_KEYS.MAX_FILE_NAME_LENGTH) ??
			DEFAULTS.MAX_FILE_NAME_LENGTH
		);
	}

	/**
	 * Get sort mode setting
	 */
	getSortMode(): 'manual' | 'alphabetical' | 'recentlyUsed' {
		const config = vscode.workspace.getConfiguration();
		return (
			config.get<'manual' | 'alphabetical' | 'recentlyUsed'>(
				CONFIG_KEYS.SORT_MODE
			) ?? DEFAULTS.SORT_MODE
		);
	}

	/**
	 * Get all settings at once
	 */
	getAllSettings(): AllSettings {
		return {
			fontSize: this.getFontSize(),
			errorColor: this.getErrorColor(),
			warningColor: this.getWarningColor(),
			showFileIcons: this.getShowFileIcons(),
			maxFileNameLength: this.getMaxFileNameLength(),
			sortMode: this.getSortMode(),
		};
	}

	/**
	 * Dispose of resources
	 */
	dispose(): void {
		this._onDidChangeSettings.dispose();
	}
}

/**
 * All available settings
 */
export interface AllSettings {
	fontSize: number;
	errorColor: string;
	warningColor: string;
	showFileIcons: boolean;
	maxFileNameLength: number;
	sortMode: 'manual' | 'alphabetical' | 'recentlyUsed';
}

/**
 * Settings change event (partial subset of changes)
 */
export interface SettingsChangeEvent {
	fontSize?: number;
	errorColor?: string;
	warningColor?: string;
	showFileIcons?: boolean;
	maxFileNameLength?: number;
	sortMode?: 'manual' | 'alphabetical' | 'recentlyUsed';
}
