// @format

import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Get the display name for a file URI with path disambiguation
 * When multiple files have the same name, adds minimal distinguishing path
 */
export function getDisambiguatedName(
	uri: vscode.Uri,
	allUris: vscode.Uri[]
): string {
	const fileName = path.basename(uri.fsPath);

	// Find other files with the same name
	const sameNameFiles = allUris.filter(
		(u) => path.basename(u.fsPath) === fileName && u.fsPath !== uri.fsPath
	);

	// If no conflicts, return just the file name
	if (sameNameFiles.length === 0) {
		return fileName;
	}

	// Find the minimum distinguishing path
	const parts = uri.fsPath.split(path.sep);

	// Start from the parent directory and work backwards
	for (let i = parts.length - 2; i >= 0; i--) {
		const disambiguator = parts[i];

		// Check if this directory name is unique among conflicting files
		const isUnique = sameNameFiles.every((other) => {
			const otherParts = other.fsPath.split(path.sep);
			// Get the corresponding directory from the other file
			const otherIndex = otherParts.length - (parts.length - i);
			return otherIndex < 0 || otherParts[otherIndex] !== disambiguator;
		});

		if (isUnique) {
			return `${fileName} • ${disambiguator}`;
		}
	}

	// Fallback: use full path if no unique parent found
	return uri.fsPath;
}

/**
 * Get relative path from workspace root
 */
export function getRelativePath(uri: vscode.Uri): string {
	const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
	if (workspaceFolder) {
		return path.relative(workspaceFolder.uri.fsPath, uri.fsPath);
	}
	return uri.fsPath;
}

/**
 * Truncate file name if it exceeds maximum length
 */
export function truncateFileName(name: string, maxLength: number): string {
	if (name.length <= maxLength) {
		return name;
	}

	const ellipsis = '...';
	const extensionMatch = name.match(/\.[^.]+$/);
	const extension = extensionMatch ? extensionMatch[0] : '';

	// Reserve space for ellipsis and extension
	const availableLength = maxLength - ellipsis.length - extension.length;

	if (availableLength <= 0) {
		// If max length is too small, just truncate
		return name.substring(0, maxLength - ellipsis.length) + ellipsis;
	}

	const baseName = extension
		? name.substring(0, name.length - extension.length)
		: name;
	return baseName.substring(0, availableLength) + ellipsis + extension;
}

/**
 * Normalize path separators for consistent comparison
 */
export function normalizePath(filePath: string): string {
	return filePath.replace(/\\/g, '/');
}
