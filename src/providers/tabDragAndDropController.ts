// @format

import * as vscode from 'vscode';
import { TabTreeItem, isTabItem, isGroupItem } from '../models/treeItems';
import { MIME_TYPES } from '../utils/constants';
import { PersistenceService } from '../services/persistenceService';
import { TabSyncService } from '../services/tabSyncService';

/**
 * Drag and drop controller for tree items
 */
export class TabDragAndDropController
	implements vscode.TreeDragAndDropController<TabTreeItem>
{
	readonly dropMimeTypes = [MIME_TYPES.TREE_ITEM];
	readonly dragMimeTypes = [MIME_TYPES.TREE_ITEM];

	constructor(
		private readonly persistenceService: PersistenceService,
		private readonly tabSyncService: TabSyncService
	) {}

	/**
	 * Handle drag operation
	 */
	async handleDrag(
		source: readonly TabTreeItem[],
		dataTransfer: vscode.DataTransfer,
		_token: vscode.CancellationToken
	): Promise<void> {
		// Serialize the source items
		const items = source.map((item) => {
			if (isTabItem(item)) {
				return {
					type: 'tab' as const,
					id: item.tab.id,
				};
			} else {
				return {
					type: 'group' as const,
					id: item.group.id,
				};
			}
		});

		dataTransfer.set(
			MIME_TYPES.TREE_ITEM,
			new vscode.DataTransferItem(JSON.stringify(items))
		);
	}

	/**
	 * Handle drop operation
	 */
	async handleDrop(
		target: TabTreeItem | undefined,
		dataTransfer: vscode.DataTransfer,
		_token: vscode.CancellationToken
	): Promise<void> {
		const transferItem = dataTransfer.get(MIME_TYPES.TREE_ITEM);
		if (!transferItem) {
			return;
		}

		try {
			const items = JSON.parse(transferItem.value);

			// Handle tab drops
			if (items.length === 1 && items[0].type === 'tab') {
				await this.handleTabDrop(items[0].id, target);
			}
			// Handle group drops
			else if (items.length === 1 && items[0].type === 'group') {
				await this.handleGroupDrop(items[0].id, target);
			}
		} catch (error) {
			console.error('Failed to handle drop:', error);
		}
	}

	/**
	 * Handle dropping a tab
	 */
	private async handleTabDrop(
		draggedTabId: string,
		target: TabTreeItem | undefined
	): Promise<void> {
		const draggedTab = this.tabSyncService.getTab(draggedTabId);
		if (!draggedTab) {
			return;
		}

		// Dropped on a group header - assign to group
		if (target && isGroupItem(target)) {
			await this.persistenceService.assignTabToGroup(
				draggedTabId,
				target.group.id
			);
			// Set sort order to end of group
			const groupTabs = this.tabSyncService
				.getTabs()
				.filter((t) => t.groupId === target.group.id);
			const maxSortOrder = Math.max(
				0,
				...groupTabs.map((t) => t.sortOrder)
			);
			await this.persistenceService.setTabSortOrder(
				draggedTabId,
				maxSortOrder + 1
			);
			this.tabSyncService.syncTabs();
			return;
		}

		// Dropped on another tab - reorder
		if (target && isTabItem(target)) {
			const targetTab = target.tab;

			// If both tabs are in the same group or both ungrouped, reorder
			if (draggedTab.groupId === targetTab.groupId) {
				await this.reorderTab(draggedTabId, targetTab.id);
			}
			// Otherwise, move to target's group and position
			else {
				await this.persistenceService.assignTabToGroup(
					draggedTabId,
					targetTab.groupId
				);
				await this.reorderTab(draggedTabId, targetTab.id);
			}

			this.tabSyncService.syncTabs();
			return;
		}

		// Dropped on empty area - ungroup
		if (!target) {
			await this.persistenceService.assignTabToGroup(draggedTabId, null);
			this.tabSyncService.syncTabs();
		}
	}

	/**
	 * Handle dropping a group
	 */
	private async handleGroupDrop(
		draggedGroupId: string,
		target: TabTreeItem | undefined
	): Promise<void> {
		// Only allow reordering groups
		if (target && isGroupItem(target)) {
			await this.reorderGroup(draggedGroupId, target.group.id);
		}
	}

	/**
	 * Reorder a tab relative to another tab
	 */
	private async reorderTab(
		draggedTabId: string,
		targetTabId: string
	): Promise<void> {
		const draggedTab = this.tabSyncService.getTab(draggedTabId);
		const targetTab = this.tabSyncService.getTab(targetTabId);

		if (!draggedTab || !targetTab) {
			return;
		}

		// Get all tabs in the same context (same group or ungrouped)
		const contextTabs = this.tabSyncService
			.getTabs()
			.filter((t) => t.groupId === draggedTab.groupId)
			.filter((t) => t.id !== draggedTabId) // Exclude dragged tab
			.sort((a, b) => a.sortOrder - b.sortOrder);

		// Insert dragged tab before target tab
		const targetIndex = contextTabs.findIndex((t) => t.id === targetTabId);

		if (targetIndex === -1) {
			return;
		}

		// Reassign sort orders
		let newSortOrder = 0;
		for (let i = 0; i < contextTabs.length; i++) {
			if (i === targetIndex) {
				// Insert dragged tab here
				await this.persistenceService.setTabSortOrder(
					draggedTabId,
					newSortOrder++
				);
			}

			await this.persistenceService.setTabSortOrder(
				contextTabs[i].id,
				newSortOrder++
			);
		}

		// If target was at the end, append dragged tab
		if (targetIndex === contextTabs.length) {
			await this.persistenceService.setTabSortOrder(
				draggedTabId,
				newSortOrder
			);
		}
	}

	/**
	 * Reorder a group relative to another group
	 */
	private async reorderGroup(
		draggedGroupId: string,
		targetGroupId: string
	): Promise<void> {
		const groups = this.persistenceService
			.getGroups()
			.filter((g) => g.id !== draggedGroupId)
			.sort((a, b) => a.sortOrder - b.sortOrder);

		const targetIndex = groups.findIndex((g) => g.id === targetGroupId);

		if (targetIndex === -1) {
			return;
		}

		// Reassign sort orders
		let newSortOrder = 0;
		for (let i = 0; i < groups.length; i++) {
			if (i === targetIndex) {
				await this.persistenceService.setGroupSortOrder(
					draggedGroupId,
					newSortOrder++
				);
			}

			await this.persistenceService.setGroupSortOrder(
				groups[i].id,
				newSortOrder++
			);
		}

		// If target was at the end, append dragged group
		if (targetIndex === groups.length) {
			await this.persistenceService.setGroupSortOrder(
				draggedGroupId,
				newSortOrder
			);
		}
	}
}
