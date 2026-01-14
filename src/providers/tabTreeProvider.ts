// @format

import * as vscode from 'vscode';
import { TabTreeItem, TabItem, GroupItem } from '../models/treeItems';
import { Tab } from '../models/tab';
import { TabGroup } from '../models/tabGroup';

/**
 * Tree data provider for the vertical tabs view
 */
export class TabTreeProvider
	implements vscode.TreeDataProvider<TabTreeItem>
{
	private _onDidChangeTreeData = new vscode.EventEmitter<
		TabTreeItem | undefined | null | void
	>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	private tabs: Tab[] = [];
	private groups: TabGroup[] = [];

	/**
	 * Set tabs to display
	 */
	setTabs(tabs: Tab[]): void {
		this.tabs = tabs;
	}

	/**
	 * Set groups to display
	 */
	setGroups(groups: TabGroup[]): void {
		this.groups = groups;
	}

	/**
	 * Refresh the tree view
	 */
	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	/**
	 * Get tree item representation
	 */
	getTreeItem(element: TabTreeItem): vscode.TreeItem {
		return element;
	}

	/**
	 * Get children for a tree item
	 */
	getChildren(element?: TabTreeItem): TabTreeItem[] {
		if (!element) {
			// Root level: show groups and ungrouped tabs
			return this.getRootItems();
		}

		// If element is a group, show its tabs
		if (element instanceof GroupItem) {
			return this.getGroupTabs(element.group.id);
		}

		// Tabs have no children
		return [];
	}

	/**
	 * Get root level items (groups and ungrouped tabs)
	 */
	private getRootItems(): TabTreeItem[] {
		const items: TabTreeItem[] = [];

		// Sort groups by sort order
		const sortedGroups = [...this.groups].sort(
			(a, b) => a.sortOrder - b.sortOrder
		);

		// Add group items
		for (const group of sortedGroups) {
			const tabsInGroup = this.tabs.filter((tab) => tab.groupId === group.id);
			items.push(new GroupItem(group, tabsInGroup.length));
		}

		// Add ungrouped tabs (sorted by sort order)
		const ungroupedTabs = this.tabs
			.filter((tab) => tab.groupId === null)
			.sort((a, b) => a.sortOrder - b.sortOrder);

		for (const tab of ungroupedTabs) {
			items.push(new TabItem(tab));
		}

		return items;
	}

	/**
	 * Get tabs for a specific group
	 */
	private getGroupTabs(groupId: string): TabTreeItem[] {
		const groupTabs = this.tabs
			.filter((tab) => tab.groupId === groupId)
			.sort((a, b) => a.sortOrder - b.sortOrder);

		return groupTabs.map((tab) => new TabItem(tab));
	}

	/**
	 * Get parent of a tree item
	 */
	getParent(element: TabTreeItem): TabTreeItem | undefined {
		if (element instanceof TabItem && element.tab.groupId) {
			const group = this.groups.find((g) => g.id === element.tab.groupId);
			if (group) {
				const tabsInGroup = this.tabs.filter(
					(tab) => tab.groupId === group.id
				);
				return new GroupItem(group, tabsInGroup.length);
			}
		}
		return undefined;
	}

	/**
	 * Dispose of resources
	 */
	dispose(): void {
		this._onDidChangeTreeData.dispose();
	}
}
