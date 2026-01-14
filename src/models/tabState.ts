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
export function isValidTabState(state: any): state is TabState {
	return (
		state &&
		typeof state === 'object' &&
		typeof state.version === 'number' &&
		Array.isArray(state.groups) &&
		typeof state.tabGroupAssignments === 'object' &&
		typeof state.customSortOrder === 'object' &&
		typeof state.groupSortOrder === 'object' &&
		typeof state.lastUpdated === 'number'
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
