// @format

import * as vscode from 'vscode';

/**
 * Diagnostic status for a tab
 */
export enum DiagnosticStatus {
	None = 'none',
	Warning = 'warning',
	Error = 'error',
}

/**
 * Represents an open file tab
 */
export interface Tab {
	/** Unique identifier using file URI string */
	id: string;

	/** File URI */
	uri: vscode.Uri;

	/** Display name (may include path disambiguation) */
	displayName: string;

	/** Plain file name (without path) */
	fileName: string;

	/** Whether the file has unsaved changes */
	isDirty: boolean;

	/** Diagnostic status (error/warning/none) */
	diagnosticStatus: DiagnosticStatus;

	/** Group ID this tab belongs to (null if ungrouped) */
	groupId: string | null;

	/** Sort order position (within group or globally) */
	sortOrder: number;

	/** Source editor group index (for reference only) */
	sourceTabGroupIndex: number;
}

/**
 * Create a Tab from a VS Code tab
 */
export function createTab(
	vsTab: vscode.Tab,
	groupIndex: number,
	displayName: string,
	sortOrder: number = 0,
	groupId: string | null = null,
	diagnosticStatus: DiagnosticStatus = DiagnosticStatus.None
): Tab | null {
	// Only handle text document tabs
	if (!(vsTab.input instanceof vscode.TabInputText)) {
		return null;
	}

	const uri = vsTab.input.uri;
	const fileName = uri.fsPath.split(/[/\\]/).pop() || uri.fsPath;

	return {
		id: uri.toString(),
		uri,
		displayName,
		fileName,
		isDirty: vsTab.isDirty,
		diagnosticStatus,
		groupId,
		sortOrder,
		sourceTabGroupIndex: groupIndex,
	};
}

/**
 * Update tab's diagnostic status
 */
export function updateTabDiagnostics(
	tab: Tab,
	diagnostics: vscode.Diagnostic[]
): Tab {
	let status = DiagnosticStatus.None;

	// Check for errors first (higher priority)
	if (diagnostics.some((d) => d.severity === vscode.DiagnosticSeverity.Error)) {
		status = DiagnosticStatus.Error;
	} else if (
		diagnostics.some((d) => d.severity === vscode.DiagnosticSeverity.Warning)
	) {
		status = DiagnosticStatus.Warning;
	}

	return {
		...tab,
		diagnosticStatus: status,
	};
}
