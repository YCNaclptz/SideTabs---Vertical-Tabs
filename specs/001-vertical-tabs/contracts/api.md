<!-- @format -->

# API Contracts: Vertical Tabs Sidebar

**Created**: 2026-01-13
**Type**: VS Code Extension Commands & Configuration

## Commands (package.json contributes.commands)

VS Code 擴充功能透過 commands 提供功能，以下定義所有對外命令。

### Tab Operations

```json
{
	"command": "sideTabs.openTab",
	"title": "Open Tab",
	"category": "SideTabs"
}
```

- **Trigger**: 點擊 TreeView 項目
- **Input**: Tab URI (string)
- **Output**: void
- **Side Effect**: 切換編輯器到指定檔案

---

```json
{
	"command": "sideTabs.closeTab",
	"title": "Close Tab",
	"category": "SideTabs"
}
```

- **Trigger**: 右鍵選單 "Close"
- **Input**: Tab URI (string)
- **Output**: void
- **Side Effect**: 關閉對應的編輯器頁籤

---

```json
{
	"command": "sideTabs.revealInExplorer",
	"title": "Reveal in File Explorer",
	"category": "SideTabs"
}
```

- **Trigger**: 右鍵選單 "Reveal in File Explorer"
- **Input**: Tab URI (string)
- **Output**: void
- **Side Effect**: 開啟系統檔案管理器並定位到檔案

---

```json
{
	"command": "sideTabs.copyPath",
	"title": "Copy Path",
	"category": "SideTabs"
}
```

- **Trigger**: 右鍵選單 "Copy Path"
- **Input**: Tab URI (string)
- **Output**: void
- **Side Effect**: 檔案完整路徑複製到剪貼簿

---

```json
{
	"command": "sideTabs.copyRelativePath",
	"title": "Copy Relative Path",
	"category": "SideTabs"
}
```

- **Trigger**: 右鍵選單 "Copy Relative Path"
- **Input**: Tab URI (string)
- **Output**: void
- **Side Effect**: 檔案相對路徑複製到剪貼簿

### Group Operations

```json
{
	"command": "sideTabs.createGroup",
	"title": "Create New Group",
	"category": "SideTabs"
}
```

- **Trigger**: 工具列按鈕或右鍵選單
- **Input**: void
- **Output**: void
- **Side Effect**: 建立新群組，顯示輸入框讓使用者命名

---

```json
{
	"command": "sideTabs.renameGroup",
	"title": "Rename Group",
	"category": "SideTabs"
}
```

- **Trigger**: 右鍵群組選單 "Rename"
- **Input**: Group ID (string)
- **Output**: void
- **Side Effect**: 顯示輸入框讓使用者重新命名

---

```json
{
	"command": "sideTabs.deleteGroup",
	"title": "Delete Group",
	"category": "SideTabs"
}
```

- **Trigger**: 右鍵群組選單 "Delete"
- **Input**: Group ID (string)
- **Output**: void
- **Side Effect**: 刪除群組，成員頁籤移至未分組區域

---

```json
{
	"command": "sideTabs.toggleGroupCollapse",
	"title": "Toggle Group Collapse",
	"category": "SideTabs"
}
```

- **Trigger**: 點擊群組摺疊圖示
- **Input**: Group ID (string)
- **Output**: void
- **Side Effect**: 切換群組摺疊/展開狀態

---

## Configuration Schema (package.json contributes.configuration)

```json
{
	"sideTabs.fontSize": {
		"type": "number",
		"default": 13,
		"minimum": 8,
		"maximum": 24,
		"description": "Font size for tab labels in pixels"
	},
	"sideTabs.errorColor": {
		"type": "string",
		"default": "#f14c4c",
		"format": "color",
		"description": "Color for tabs with errors"
	},
	"sideTabs.warningColor": {
		"type": "string",
		"default": "#cca700",
		"format": "color",
		"description": "Color for tabs with warnings"
	},
	"sideTabs.showFileIcons": {
		"type": "boolean",
		"default": true,
		"description": "Show file type icons next to tab names"
	},
	"sideTabs.maxFileNameLength": {
		"type": "number",
		"default": 30,
		"minimum": 10,
		"maximum": 100,
		"description": "Maximum file name length before truncation"
	},
	"sideTabs.sortMode": {
		"type": "string",
		"enum": ["manual", "alphabetical", "recentlyUsed"],
		"default": "manual",
		"description": "Default tab sorting mode"
	}
}
```

---

## View Container & View (package.json contributes)

```json
{
	"viewsContainers": {
		"activitybar": [
			{
				"id": "sideTabs",
				"title": "Vertical Tabs",
				"icon": "resources/icon.svg"
			}
		]
	},
	"views": {
		"sideTabs": [
			{
				"id": "verticalTabsView",
				"name": "Open Tabs",
				"contextualTitle": "Vertical Tabs"
			}
		]
	}
}
```

---

## Context Menu (package.json contributes.menus)

### Tab Context Menu

```json
{
	"view/item/context": [
		{
			"command": "sideTabs.closeTab",
			"when": "view == verticalTabsView && viewItem == tab",
			"group": "1_close"
		},
		{
			"command": "sideTabs.revealInExplorer",
			"when": "view == verticalTabsView && viewItem == tab",
			"group": "2_file"
		},
		{
			"command": "sideTabs.copyPath",
			"when": "view == verticalTabsView && viewItem == tab",
			"group": "2_file"
		},
		{
			"command": "sideTabs.copyRelativePath",
			"when": "view == verticalTabsView && viewItem == tab",
			"group": "2_file"
		}
	]
}
```

### Group Context Menu

```json
{
	"view/item/context": [
		{
			"command": "sideTabs.renameGroup",
			"when": "view == verticalTabsView && viewItem == group",
			"group": "1_group"
		},
		{
			"command": "sideTabs.deleteGroup",
			"when": "view == verticalTabsView && viewItem == group",
			"group": "1_group"
		}
	]
}
```

### View Title Menu (Toolbar)

```json
{
	"view/title": [
		{
			"command": "sideTabs.createGroup",
			"when": "view == verticalTabsView",
			"group": "navigation"
		}
	]
}
```

---

## TreeDataProvider Contract

```typescript
interface TabTreeProvider extends vscode.TreeDataProvider<TabTreeItem> {
	// 必須實作
	getTreeItem(element: TabTreeItem): vscode.TreeItem;
	getChildren(element?: TabTreeItem): TabTreeItem[];

	// 可選實作
	getParent?(element: TabTreeItem): TabTreeItem | undefined;
	resolveTreeItem?(
		item: vscode.TreeItem,
		element: TabTreeItem
	): vscode.TreeItem;

	// 事件
	onDidChangeTreeData: vscode.Event<TabTreeItem | undefined>;
}

type TabTreeItem = TabItem | GroupItem;

interface TabItem {
	type: 'tab';
	tab: Tab;
}

interface GroupItem {
	type: 'group';
	group: TabGroup;
}
```

---

## TreeDragAndDropController Contract

```typescript
interface TabDragAndDropController
	extends vscode.TreeDragAndDropController<TabTreeItem> {
	readonly dropMimeTypes: ['application/vnd.code.tree.verticaltabsview'];
	readonly dragMimeTypes: ['application/vnd.code.tree.verticaltabsview'];

	handleDrag(
		source: readonly TabTreeItem[],
		dataTransfer: vscode.DataTransfer,
		token: vscode.CancellationToken
	): void;

	handleDrop(
		target: TabTreeItem | undefined,
		dataTransfer: vscode.DataTransfer,
		token: vscode.CancellationToken
	): void;
}
```

**Drop Behavior**:
| Source | Target | Result |
|--------|--------|--------|
| Tab | Tab (same level) | 重新排序 |
| Tab | Tab (in group) | 移入該群組 |
| Tab | Group header | 移入該群組 |
| Tab | Empty area | 移出群組 |
| Group | Group | 重新排序群組 |

---

## Activation Events

```json
{
	"activationEvents": ["onView:verticalTabsView", "onStartupFinished"]
}
```
