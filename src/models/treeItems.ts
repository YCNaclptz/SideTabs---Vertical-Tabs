// @format

import * as vscode from 'vscode';
import { Tab } from './tab';
import { TabGroup } from './tabGroup';
import { CONTEXT_VALUES } from '../utils/constants';

/**
 * Tree item for a tab
 */
export class TabItem extends vscode.TreeItem {
	constructor(public readonly tab: Tab) {
		super(tab.displayName, vscode.TreeItemCollapsibleState.None);

		this.id = tab.id;
		this.tooltip = tab.uri.fsPath;
		this.resourceUri = tab.uri;
		this.contextValue = CONTEXT_VALUES.TAB;

		// Set command to open the file when clicked
		this.command = {
			command: 'vscode.open',
			title: 'Open File',
			arguments: [tab.uri],
		};

		// Add description for dirty files
		if (tab.isDirty) {
			this.description = '(modified)';
		}
	}
}

/**
 * Tree item for a tab group
 */
export class GroupItem extends vscode.TreeItem {
	constructor(
		public readonly group: TabGroup,
		private readonly tabCount: number
	) {
		super(
			group.name,
			group.isCollapsed
				? vscode.TreeItemCollapsibleState.Collapsed
				: vscode.TreeItemCollapsibleState.Expanded
		);

		this.id = group.id;
		this.tooltip = `${group.name} (${tabCount} tabs)`;
		this.contextValue = CONTEXT_VALUES.GROUP;
		this.description = `${tabCount}`;

		// Add folder icon
		this.iconPath = new vscode.ThemeIcon('folder');
	}
}

/**
 * Union type for tree items
 */
export type TabTreeItem = TabItem | GroupItem;

/**
 * Type guards
 */
export function isTabItem(item: TabTreeItem): item is TabItem {
	return item instanceof TabItem;
}

export function isGroupItem(item: TabTreeItem): item is GroupItem {
	return item instanceof GroupItem;
}
