// @format

/**
 * Configuration keys for VS Code settings
 */
export const CONFIG_KEYS = {
	FONT_SIZE: 'sideTabs.fontSize',
	ERROR_COLOR: 'sideTabs.errorColor',
	WARNING_COLOR: 'sideTabs.warningColor',
	SHOW_FILE_ICONS: 'sideTabs.showFileIcons',
	MAX_FILE_NAME_LENGTH: 'sideTabs.maxFileNameLength',
	SORT_MODE: 'sideTabs.sortMode',
} as const;

/**
 * WorkspaceState keys for persistence
 */
export const STORAGE_KEYS = {
	TAB_STATE: 'sideTabs.tabState',
	STATE_VERSION: 'sideTabs.stateVersion',
} as const;

/**
 * Command IDs
 */
export const COMMANDS = {
	OPEN_TAB: 'sideTabs.openTab',
	CLOSE_TAB: 'sideTabs.closeTab',
	REVEAL_IN_EXPLORER: 'sideTabs.revealInExplorer',
	COPY_PATH: 'sideTabs.copyPath',
	COPY_RELATIVE_PATH: 'sideTabs.copyRelativePath',
	CREATE_GROUP: 'sideTabs.createGroup',
	RENAME_GROUP: 'sideTabs.renameGroup',
	DELETE_GROUP: 'sideTabs.deleteGroup',
	TOGGLE_GROUP_COLLAPSE: 'sideTabs.toggleGroupCollapse',
} as const;

/**
 * View IDs
 */
export const VIEWS = {
	VERTICAL_TABS: 'verticalTabsView',
} as const;

/**
 * TreeItem context values for menu filtering
 */
export const CONTEXT_VALUES = {
	TAB: 'tab',
	GROUP: 'group',
} as const;

/**
 * Drag and drop MIME types
 */
export const MIME_TYPES = {
	TREE_ITEM: 'application/vnd.code.tree.verticaltabsview',
} as const;

/**
 * Current state version for migration
 */
export const STATE_VERSION = 1;

/**
 * Default configuration values
 */
export const DEFAULTS = {
	FONT_SIZE: 13,
	ERROR_COLOR: '#f14c4c',
	WARNING_COLOR: '#cca700',
	SHOW_FILE_ICONS: true,
	MAX_FILE_NAME_LENGTH: 30,
	SORT_MODE: 'manual' as const,
} as const;
