// @format

import { TabGroup } from './tabGroup';

/**
 * Persistent state for tabs and groups
 */
export interface TabState {
	/** State version for migration */
	version: number;

	/** All custom groups */
	groups: TabGroup[];

	/** Mapping of tab ID to group ID */
	tabGroupAssignments: Record<string, string>;

	/** Custom sort order for tabs */
	customSortOrder: Record<string, number>;

	/** Sort order for groups */
	groupSortOrder: Record<string, number>;

	/** Last update timestamp */
	lastUpdated: number;
}

/**
 * Create an empty tab state
 */
export function createEmptyTabState(version: number): TabState {
	return {
		version,
		groups: [],
		tabGroupAssignments: {},
		customSortOrder: {},
		groupSortOrder: {},
		lastUpdated: Date.now(),
	};
}

/**
 * Validate tab state structure
 */
export function isValidTabState(state: unknown): state is TabState {
	if (
		!state ||
		typeof state !== 'object'
	) {
		return false;
	}

	const obj = state as Record<string, unknown>;

	return (
		typeof obj.version === 'number' &&
		Array.isArray(obj.groups) &&
		typeof obj.tabGroupAssignments === 'object' &&
		typeof obj.customSortOrder === 'object' &&
		typeof obj.groupSortOrder === 'object' &&
		typeof obj.lastUpdated === 'number'
	);
}

/**
 * Migrate tab state to current version
 */
export function migrateTabState(
	state: TabState,
	currentVersion: number
): TabState {
	if (state.version === currentVersion) {
		return state;
	}

	// Future migration logic would go here
	// For now, just update version
	return {
		...state,
		version: currentVersion,
		lastUpdated: Date.now(),
	};
}
