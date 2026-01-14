<!-- @format -->

# Quickstart: Vertical Tabs Sidebar

**Purpose**: 快速啟動開發環境並驗證基本功能

## Prerequisites

- Node.js 18+
- VS Code 1.85+
- npm 或 yarn

## Setup

### 1. 初始化專案

```bash
# 建立專案結構
npm init -y

# 安裝開發依賴
npm install -D typescript @types/vscode @types/node
npm install -D @vscode/test-electron jest ts-jest @types/jest
npm install -D esbuild eslint prettier
```

### 2. 設定 TypeScript

建立 `tsconfig.json`:

```json
{
	"compilerOptions": {
		"module": "commonjs",
		"target": "ES2020",
		"outDir": "out",
		"lib": ["ES2020"],
		"sourceMap": true,
		"rootDir": "src",
		"strict": true,
		"esModuleInterop": true,
		"skipLibCheck": true
	},
	"exclude": ["node_modules", ".vscode-test"]
}
```

### 3. 設定 package.json

更新 `package.json`:

```json
{
	"name": "sidetabs",
	"displayName": "SideTabs - Vertical Tabs",
	"description": "Vertical tab management in sidebar",
	"version": "0.1.0",
	"engines": {
		"vscode": "^1.85.0"
	},
	"categories": ["Other"],
	"activationEvents": ["onStartupFinished"],
	"main": "./out/extension.js",
	"contributes": {
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
					"name": "Open Tabs"
				}
			]
		},
		"commands": [
			{
				"command": "sideTabs.createGroup",
				"title": "Create Group",
				"icon": "$(add)"
			}
		],
		"menus": {
			"view/title": [
				{
					"command": "sideTabs.createGroup",
					"when": "view == verticalTabsView",
					"group": "navigation"
				}
			]
		}
	},
	"scripts": {
		"compile": "tsc -p ./",
		"watch": "tsc -watch -p ./",
		"lint": "eslint src --ext ts",
		"test": "jest"
	}
}
```

### 4. 建立基本結構

```bash
mkdir -p src/providers src/models src/services src/commands src/utils
mkdir -p tests/unit tests/integration
mkdir -p resources
```

### 5. 建立最小可運行版本

建立 `src/extension.ts`:

```typescript
import * as vscode from 'vscode';
import { TabTreeProvider } from './providers/tabTreeProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log('SideTabs is now active!');

	const treeProvider = new TabTreeProvider();

	const treeView = vscode.window.createTreeView('verticalTabsView', {
		treeDataProvider: treeProvider,
		showCollapseAll: true,
	});

	context.subscriptions.push(treeView);

	// 監聽頁籤變化
	context.subscriptions.push(
		vscode.window.tabGroups.onDidChangeTabs(() => {
			treeProvider.refresh();
		})
	);
}

export function deactivate() {}
```

建立 `src/providers/tabTreeProvider.ts`:

```typescript
import * as vscode from 'vscode';

export class TabTreeProvider implements vscode.TreeDataProvider<TabItem> {
	private _onDidChangeTreeData = new vscode.EventEmitter<TabItem | undefined>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}

	getTreeItem(element: TabItem): vscode.TreeItem {
		return element;
	}

	getChildren(): TabItem[] {
		const tabs: TabItem[] = [];

		for (const group of vscode.window.tabGroups.all) {
			for (const tab of group.tabs) {
				if (tab.input instanceof vscode.TabInputText) {
					tabs.push(new TabItem(tab.input.uri, tab.isDirty));
				}
			}
		}

		return tabs;
	}
}

class TabItem extends vscode.TreeItem {
	constructor(
		public readonly uri: vscode.Uri,
		public readonly isDirty: boolean
	) {
		super(uri, vscode.TreeItemCollapsibleState.None);

		this.label = this.getLabel();
		this.tooltip = uri.fsPath;
		this.command = {
			command: 'vscode.open',
			title: 'Open File',
			arguments: [uri],
		};

		if (isDirty) {
			this.description = '(modified)';
		}
	}

	private getLabel(): string {
		const parts = this.uri.fsPath.split(/[/\\]/);
		return parts[parts.length - 1];
	}
}
```

### 6. 建立圖示

建立 `resources/icon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
  <rect x="1" y="1" width="14" height="3" rx="0.5" fill="#888"/>
  <rect x="1" y="6" width="14" height="3" rx="0.5" fill="#888"/>
  <rect x="1" y="11" width="14" height="3" rx="0.5" fill="#888"/>
</svg>
```

## Run & Debug

### 啟動開發模式

1. 按 `F5` 或執行 "Run Extension"
2. 新的 VS Code 視窗開啟（Extension Development Host）
3. 側邊欄應顯示 "Vertical Tabs" 圖示
4. 開啟幾個檔案，確認頁籤出現在側邊欄

### 建立 launch.json

```json
{
	"version": "0.2.0",
	"configurations": [
		{
			"name": "Run Extension",
			"type": "extensionHost",
			"request": "launch",
			"args": ["--extensionDevelopmentPath=${workspaceFolder}"],
			"outFiles": ["${workspaceFolder}/out/**/*.js"],
			"preLaunchTask": "npm: compile"
		}
	]
}
```

### 建立 tasks.json

```json
{
	"version": "2.0.0",
	"tasks": [
		{
			"type": "npm",
			"script": "compile",
			"problemMatcher": "$tsc",
			"group": {
				"kind": "build",
				"isDefault": true
			}
		},
		{
			"type": "npm",
			"script": "watch",
			"problemMatcher": "$tsc-watch",
			"isBackground": true
		}
	]
}
```

## Validation Checklist

執行以下步驟驗證 MVP：

- [ ] `npm run compile` 編譯成功
- [ ] F5 啟動 Extension Development Host
- [ ] 側邊欄顯示 Vertical Tabs 圖示
- [ ] 開啟檔案後，頁籤出現在側邊欄
- [ ] 點擊頁籤可切換到對應檔案
- [ ] 修改檔案後顯示 "(modified)"
- [ ] 關閉檔案後頁籤消失

## Next Steps

MVP 驗證完成後，按照 [tasks.md](tasks.md) 逐步實作：

1. P1: 基本垂直頁籤 (US1)
2. P2: 狀態指示器 (US2)
3. P3: 拖曳排序 (US3)
4. P4: 群組功能 (US4)
5. P5: 外觀設定 (US5)
6. P6: 路徑功能 (US6)
