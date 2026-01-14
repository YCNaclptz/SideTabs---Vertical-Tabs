// @format

/**
 * Represents a custom tab group
 */
export interface TabGroup {
	/** Unique identifier (UUID) */
	id: string;

	/** Group name (user editable) */
	name: string;

	/** Whether the group is collapsed */
	isCollapsed: boolean;

	/** Sort order position (in group list) */
	sortOrder: number;

	/** Creation timestamp */
	createdAt: number;
}

/**
 * Create a new tab group
 */
export function createTabGroup(
	name: string,
	sortOrder: number = 0,
	isCollapsed: boolean = false
): TabGroup {
	return {
		id: generateUUID(),
		name,
		isCollapsed,
		sortOrder,
		createdAt: Date.now(),
	};
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

/**
 * Validate group name
 */
export function isValidGroupName(name: string): boolean {
	return name.trim().length > 0 && name.length <= 50;
}
