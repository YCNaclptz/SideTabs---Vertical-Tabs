<!-- @format -->

# Data Model: Vertical Tabs Sidebar

**Created**: 2026-01-13
**Source**: [spec.md](spec.md) Key Entities

## Entity Definitions

### Tab

代表一個開啟的檔案頁籤。

```typescript
interface Tab {
	/** 唯一識別碼，使用檔案 URI 字串 */
	id: string;

	/** 檔案完整路徑 URI */
	uri: vscode.Uri;

	/** 顯示名稱（可能包含路徑歧義消除） */
	displayName: string;

	/** 純檔案名稱（不含路徑） */
	fileName: string;

	/** 是否有未儲存變更 */
	isDirty: boolean;

	/** 診斷狀態 */
	diagnosticStatus: DiagnosticStatus;

	/** 所屬群組 ID（null 表示未分組） */
	groupId: string | null;

	/** 排序位置（群組內或全域） */
	sortOrder: number;

	/** 來源編輯器群組索引（僅供參考，不影響顯示） */
	sourceTabGroupIndex: number;
}

enum DiagnosticStatus {
	None = 'none',
	Warning = 'warning',
	Error = 'error',
}
```

**Validation Rules**:

- `id` 必須唯一，使用 `uri.toString()` 作為識別碼
- `displayName` 當同名檔案存在時，自動加上最少區分路徑
- `sortOrder` 必須 >= 0，在群組內或全域清單中唯一

**State Transitions**:

```
[開啟檔案] → Tab created (isDirty: false, diagnosticStatus: None)
[修改檔案] → isDirty: true
[儲存檔案] → isDirty: false
[診斷變更] → diagnosticStatus: Error | Warning | None
[拖曳排序] → sortOrder updated
[加入群組] → groupId set
[移出群組] → groupId: null
[關閉檔案] → Tab deleted
```

---

### TabGroup

代表一個頁籤群組，支援摺疊/展開。

```typescript
interface TabGroup {
	/** 唯一識別碼 (UUID) */
	id: string;

	/** 群組名稱（使用者可編輯） */
	name: string;

	/** 是否摺疊 */
	isCollapsed: boolean;

	/** 排序位置（在群組清單中） */
	sortOrder: number;

	/** 建立時間 */
	createdAt: number;
}
```

**Validation Rules**:

- `id` 使用 UUID v4 生成
- `name` 不可為空，最大長度 50 字元
- `sortOrder` 必須 >= 0，在群組清單中唯一

**State Transitions**:

```
[建立群組] → TabGroup created (isCollapsed: false)
[重新命名] → name updated
[摺疊] → isCollapsed: true
[展開] → isCollapsed: false
[拖曳排序] → sortOrder updated
[最後一個成員移除] → TabGroup deleted (自動移除)
```

---

### TabState

代表整體狀態，用於持久化。

```typescript
interface TabState {
	/** 狀態版本（用於遷移） */
	version: number;

	/** 所有群組 */
	groups: TabGroup[];

	/** 頁籤到群組的映射 */
	tabGroupAssignments: Record<string, string>; // tabId -> groupId

	/** 自訂排序（覆蓋預設順序） */
	customSortOrder: Record<string, number>; // tabId -> sortOrder

	/** 群組排序 */
	groupSortOrder: Record<string, number>; // groupId -> sortOrder

	/** 最後更新時間 */
	lastUpdated: number;
}
```

**Storage**: VS Code `workspaceState` (JSON serialized)

**Migration**: 當 `version` 不符時，執行遷移邏輯

---

### UserSettings

代表使用者設定，透過 VS Code configuration 管理。

```typescript
interface UserSettings {
	/** 字體大小 (px) */
	fontSize: number; // default: 13

	/** 錯誤顏色 (CSS color) */
	errorColor: string; // default: '#f14c4c'

	/** 警告顏色 (CSS color) */
	warningColor: string; // default: '#cca700'

	/** 是否顯示檔案圖示 */
	showFileIcons: boolean; // default: true

	/** 長檔名截斷位置 */
	maxFileNameLength: number; // default: 30
}
```

**Configuration Keys** (package.json):

- `sideTabs.fontSize`
- `sideTabs.errorColor`
- `sideTabs.warningColor`
- `sideTabs.showFileIcons`
- `sideTabs.maxFileNameLength`

---

## Relationships

```
┌─────────────┐
│  TabState   │
│  (1 per ws) │
└──────┬──────┘
       │ contains
       ▼
┌─────────────┐      ┌─────────────┐
│  TabGroup   │◄────►│    Tab      │
│  (0..n)     │ 1:n  │   (0..n)    │
└─────────────┘      └─────────────┘
       │                    │
       │ persisted in       │ synced from
       ▼                    ▼
┌─────────────┐      ┌─────────────────┐
│workspaceState│     │vscode.tabGroups│
└─────────────┘      └─────────────────┘
```

---

## Runtime State vs Persisted State

| 屬性                 | Runtime | Persisted | 備註                |
| -------------------- | ------- | --------- | ------------------- |
| Tab.id               | ✓       | -         | 從 VS Code API 取得 |
| Tab.uri              | ✓       | -         | 從 VS Code API 取得 |
| Tab.isDirty          | ✓       | -         | 從 VS Code API 取得 |
| Tab.diagnosticStatus | ✓       | -         | 從診斷 API 取得     |
| Tab.groupId          | ✓       | ✓         | 持久化群組關聯      |
| Tab.sortOrder        | ✓       | ✓         | 持久化自訂順序      |
| TabGroup.\*          | ✓       | ✓         | 全部持久化          |
| UserSettings.\*      | ✓       | ✓         | 透過 VS Code config |

---

## Data Flow

```
1. 啟動時
   workspaceState → TabState → 恢復群組和排序
   vscode.tabGroups → 取得目前開啟的頁籤
   合併 → 顯示清單

2. 頁籤變化時
   vscode.tabGroups.onDidChangeTabs → 更新 Tab 清單
   檢查是否有持久化的群組關聯 → 套用
   重新計算 displayName（歧義消除）

3. 診斷變化時
   languages.onDidChangeDiagnostics → 更新對應 Tab 的 diagnosticStatus
   觸發 TreeView refresh

4. 拖曳排序時
   handleDrop → 更新 sortOrder
   如果目標是群組 → 更新 groupId
   持久化 → workspaceState

5. 群組操作時
   建立/刪除/重命名 → 更新 TabState.groups
   持久化 → workspaceState
```
