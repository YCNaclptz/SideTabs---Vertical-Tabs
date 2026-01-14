<!-- @format -->

# Research: Vertical Tabs Sidebar

**Created**: 2026-01-13
**Purpose**: 解決技術問題和確定最佳實踐

## VS Code Extension API 研究

### 1. TreeView 與 TreeDataProvider

**Decision**: 使用 `TreeDataProvider` 搭配 `createTreeView` 實作側邊欄頁籤清單

**Rationale**:

- VS Code 原生支援，效能最佳
- 支援虛擬滾動，處理大量項目時記憶體效率高
- 支援拖曳功能（TreeDragAndDropController）
- 支援 collapsibleState 實現群組摺疊

**Alternatives considered**:

- Webview: 更靈活的 UI，但效能較差、無法利用原生拖曳、需要額外通訊層
- Custom View: 無此 API，不適用

**Code Pattern**:

```typescript
vscode.window.createTreeView('verticalTabs', {
	treeDataProvider: new TabTreeProvider(),
	dragAndDropController: new TabDragAndDropController(),
	canSelectMany: true,
});
```

### 2. Tab 同步 API

**Decision**: 使用 `window.tabGroups` API 監聽頁籤變化

**Rationale**:

- `window.tabGroups.onDidChangeTabs` 提供頁籤開啟/關閉/變更事件
- `window.tabGroups.onDidChangeTabGroups` 提供編輯器群組變化
- 可取得所有開啟頁籤的 URI 和狀態

**API Pattern**:

```typescript
// 監聽頁籤變化
vscode.window.tabGroups.onDidChangeTabs((event) => {
	event.opened; // 新開啟的頁籤
	event.closed; // 關閉的頁籤
	event.changed; // 變更的頁籤
});
```

### 3. 診斷訊息監聽

**Decision**: 使用 `languages.onDidChangeDiagnostics` 監聽診斷變化

**Rationale**:

- 可取得所有檔案的錯誤/警告數量
- 使用 `languages.getDiagnostics(uri)` 取得特定檔案的診斷
- DiagnosticSeverity.Error (0), Warning (1) 用於判斷顏色

**API Pattern**:

```typescript
vscode.languages.onDidChangeDiagnostics((event) => {
	for (const uri of event.uris) {
		const diagnostics = vscode.languages.getDiagnostics(uri);
		const hasError = diagnostics.some(
			(d) => d.severity === DiagnosticSeverity.Error
		);
		const hasWarning = diagnostics.some(
			(d) => d.severity === DiagnosticSeverity.Warning
		);
	}
});
```

### 4. 檔案修改狀態

**Decision**: 使用 `workspace.onDidChangeTextDocument` 搭配 `TextDocument.isDirty`

**Rationale**:

- `isDirty` 屬性直接表示檔案是否有未儲存變更
- `onDidChangeTextDocument` 在內容或 dirty 狀態變化時觸發
- `onDidSaveTextDocument` 在儲存後觸發，可清除 dirty 標記

**API Pattern**:

```typescript
vscode.workspace.onDidChangeTextDocument((event) => {
	const isDirty = event.document.isDirty;
});
```

### 5. 拖曳排序實作

**Decision**: 實作 `TreeDragAndDropController` 介面

**Rationale**:

- 原生支援，與 TreeView 無縫整合
- 使用自訂 MIME type `application/vnd.code.tree.verticaltabs`
- handleDrag/handleDrop 處理拖曳邏輯

**API Pattern**:

```typescript
class TabDragAndDropController
	implements vscode.TreeDragAndDropController<TabItem>
{
	readonly dropMimeTypes = ['application/vnd.code.tree.verticaltabs'];
	readonly dragMimeTypes = ['application/vnd.code.tree.verticaltabs'];

	handleDrag(source: TabItem[], dataTransfer: vscode.DataTransfer) {
		dataTransfer.set(
			'application/vnd.code.tree.verticaltabs',
			new vscode.DataTransferItem(source)
		);
	}

	handleDrop(target: TabItem | undefined, dataTransfer: vscode.DataTransfer) {
		const items = dataTransfer.get('application/vnd.code.tree.verticaltabs');
		// 重新排序邏輯
	}
}
```

### 6. 持久化儲存

**Decision**: 使用 `ExtensionContext.workspaceState` 儲存工作區狀態

**Rationale**:

- 頁籤排序和群組設定應該是工作區特定的
- Memento API 提供簡單的 key-value 儲存
- 自動持久化，重啟後保持

**API Pattern**:

```typescript
// 儲存
context.workspaceState.update('tabState', JSON.stringify(state));

// 讀取
const state = context.workspaceState.get<string>('tabState');
```

### 7. 設定系統

**Decision**: 使用 `contributes.configuration` 在 package.json 定義設定

**Rationale**:

- VS Code 原生設定 UI 支援
- 可定義類型、預設值、描述
- `workspace.getConfiguration('sideTabs')` 讀取

**package.json Pattern**:

```json
{
	"contributes": {
		"configuration": {
			"title": "SideTabs",
			"properties": {
				"sideTabs.fontSize": {
					"type": "number",
					"default": 13,
					"description": "Tab font size"
				},
				"sideTabs.errorColor": {
					"type": "string",
					"default": "#f14c4c",
					"description": "Color for tabs with errors"
				}
			}
		}
	}
}
```

### 8. TreeItem 樣式限制

**Decision**: 使用 `TreeItem.description` 和 `TreeItemLabel` 實現有限樣式

**Rationale**:

- TreeView 不支援完全自訂 CSS
- `TreeItemLabel.highlights` 可突出顯示文字部分
- 顏色需透過 `ThemeColor` 或 `FileDecorationProvider`
- 斜體需透過 `description` 或圖示暗示

**限制與解決方案**:
| 需求 | TreeView 支援 | 解決方案 |
|------|--------------|---------|
| 文字顏色 | 有限 | 使用 FileDecorationProvider 或 icon 顏色提示 |
| 斜體 | ❌ | 在 label 後加 "(modified)" 或使用特殊圖示 |
| 字體大小 | ❌ | 無法實現，需考慮 Webview 替代 |

**重要發現**: TreeView 的樣式自訂能力有限。如果需要完整的字體大小、顏色控制，可能需要使用 WebviewView 替代。

### 9. 路徑顯示與歧義消除

**Decision**: 實作最少區分路徑演算法

**Rationale**:

- 同名檔案需要顯示足夠的路徑資訊
- 從最後一層目錄開始，逐層增加直到唯一
- VS Code 內建的 Tab 也使用類似邏輯

**Algorithm**:

```typescript
function getDisambiguatedName(uri: Uri, allUris: Uri[]): string {
	const fileName = path.basename(uri.fsPath);
	const sameNameFiles = allUris.filter(
		(u) => path.basename(u.fsPath) === fileName && u.fsPath !== uri.fsPath
	);

	if (sameNameFiles.length === 0) {
		return fileName;
	}

	// 找到最少區分路徑
	const parts = uri.fsPath.split(path.sep);
	for (let i = parts.length - 2; i >= 0; i--) {
		const disambiguator = parts[i];
		const isUnique = sameNameFiles.every((other) => {
			const otherParts = other.fsPath.split(path.sep);
			return otherParts[otherParts.length - 2] !== disambiguator;
		});
		if (isUnique) {
			return `${fileName} (${disambiguator})`;
		}
	}

	return uri.fsPath; // fallback to full path
}
```

## 技術決策摘要

| 問題     | 決策                              | 理由                   |
| -------- | --------------------------------- | ---------------------- |
| UI 框架  | TreeView (可能升級為 WebviewView) | 原生效能好，但樣式受限 |
| 頁籤同步 | window.tabGroups API              | 官方 API，穩定可靠     |
| 診斷監聽 | languages.onDidChangeDiagnostics  | 即時獲取錯誤/警告      |
| 持久化   | workspaceState                    | 工作區特定，自動儲存   |
| 拖曳     | TreeDragAndDropController         | 原生整合               |
| 設定     | contributes.configuration         | VS Code 標準方式       |

## 待確認項目

1. **字體大小自訂**: TreeView 不支援，需決定是否升級為 WebviewView
2. **文字顏色**: 需測試 FileDecorationProvider 在 TreeView 中的效果
3. **效能測試**: 需驗證 200+ 頁籤時的滾動效能
