<!-- @format -->

# Tasks: Vertical Tabs Sidebar

**Input**: Design documents from `/specs/001-vertical-tabs/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Not explicitly requested - implementation tasks only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure:

```text
src/
├── extension.ts
├── providers/
├── models/
├── services/
├── commands/
└── utils/
tests/
├── unit/
└── integration/
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: VS Code extension project initialization and basic structure

- [X] T001 Initialize npm project with package.json per quickstart.md in package.json
- [X] T002 [P] Create TypeScript configuration in tsconfig.json
- [X] T003 [P] Create VS Code launch configuration in .vscode/launch.json
- [X] T004 [P] Create VS Code tasks configuration in .vscode/tasks.json
- [X] T005 [P] Create project directory structure: src/providers/, src/models/, src/services/, src/commands/, src/utils/
- [X] T006 [P] Create tests directory structure: tests/unit/models/, tests/unit/services/, tests/integration/
- [X] T007 [P] Create extension icon in resources/icon.svg
- [X] T008 Install development dependencies (typescript, @types/vscode, @types/node, @vscode/test-electron, jest, esbuild)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Configure package.json with extension manifest: viewsContainers, views, activationEvents per contracts/api.md
- [X] T010 [P] Create constants file with configuration keys in src/utils/constants.ts
- [X] T011 [P] Create path utilities with disambiguation algorithm in src/utils/pathUtils.ts
- [X] T012 Create base Tab interface and DiagnosticStatus enum in src/models/tab.ts
- [X] T013 [P] Create TabGroup interface in src/models/tabGroup.ts
- [X] T014 [P] Create TabState interface for persistence in src/models/tabState.ts
- [X] T015 Create TabTreeItem types (TabItem, GroupItem) for TreeDataProvider in src/models/treeItems.ts
- [X] T016 Create extension entry point skeleton with activation/deactivation in src/extension.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Tabs Vertically (Priority: P1) 🎯 MVP

**Goal**: 在側邊欄以垂直方式顯示所有開啟的檔案頁籤，點擊頁籤可切換檔案

**Independent Test**: 安裝擴充功能後，側邊欄出現新的 panel，顯示所有目前開啟的檔案頁籤，點擊任一頁籤可切換到該檔案

### Implementation for User Story 1

- [X] T017 [US1] Implement TabSyncService to sync VS Code tabs using window.tabGroups API in src/services/tabSyncService.ts
- [X] T018 [US1] Implement TabTreeProvider with getTreeItem and getChildren methods in src/providers/tabTreeProvider.ts
- [X] T019 [US1] Register TreeView with treeDataProvider in src/extension.ts
- [X] T020 [US1] Implement tab change listener (onDidChangeTabs) to refresh TreeView in src/extension.ts
- [X] T021 [US1] Add sideTabs.openTab command registration in src/commands/index.ts
- [X] T022 [US1] Configure TreeItem click handler to open file using vscode.open command in src/providers/tabTreeProvider.ts
- [X] T023 [US1] Implement file name display with tooltip showing full path in src/providers/tabTreeProvider.ts

**Checkpoint**: User Story 1 complete - basic vertical tabs with click-to-switch functionality

---

## Phase 4: User Story 2 - File Status Indicators (Priority: P2)

**Goal**: 在頁籤上顯示檔案狀態（錯誤、警告、未儲存）

**Independent Test**: 開啟一個有語法錯誤的檔案，其頁籤文字變為紅色；修改檔案但不儲存，頁籤文字顯示 "(modified)"

### Implementation for User Story 2

- [X] T024 [US2] Implement DiagnosticService to listen diagnostics using languages.onDidChangeDiagnostics in src/services/diagnosticService.ts
- [X] T025 [US2] Add diagnostic status tracking (Error/Warning/None) to Tab model in src/services/tabSyncService.ts
- [X] T026 [US2] Implement isDirty tracking using workspace.onDidChangeTextDocument in src/services/tabSyncService.ts
- [X] T027 [US2] Update TabTreeProvider to show "(modified)" description for dirty files in src/providers/tabTreeProvider.ts
- [X] T028 [US2] Implement FileDecorationProvider for error/warning colors in src/providers/tabDecorationProvider.ts
- [X] T029 [US2] Register FileDecorationProvider in extension activation in src/extension.ts

**Checkpoint**: User Story 2 complete - tabs show dirty state and diagnostic colors

---

## Phase 5: User Story 3 - Drag and Drop Sorting (Priority: P3)

**Goal**: 透過拖曳重新排序頁籤，順序持久化

**Independent Test**: 拖曳某個頁籤到另一個位置，放開後頁籤順序更新，重新開啟 VS Code 後順序保持不變

### Implementation for User Story 3

- [x] T030 [US3] Implement PersistenceService using workspaceState in src/services/persistenceService.ts
- [x] T031 [US3] Implement TabDragAndDropController with handleDrag method in src/providers/tabDragAndDropController.ts
- [x] T032 [US3] Implement handleDrop method for reordering tabs in src/providers/tabDragAndDropController.ts
- [x] T033 [US3] Register DragAndDropController in TreeView creation in src/extension.ts
- [x] T034 [US3] Add sortOrder tracking to TabState and persist on change in src/services/persistenceService.ts
- [x] T035 [US3] Restore tab order from workspaceState on activation in src/extension.ts

**Checkpoint**: User Story 3 complete - tabs can be reordered via drag-drop with persistence

---

## Phase 6: User Story 4 - Tab Groups (Priority: P4)

**Goal**: 將頁籤分組並可摺疊/展開

**Independent Test**: 建立新群組、將頁籤拖曳至群組、摺疊/展開群組、重新命名群組

### Implementation for User Story 4

- [X] T036 [US4] Add group management methods to PersistenceService in src/services/persistenceService.ts
- [X] T037 [US4] Implement sideTabs.createGroup command with input box in src/commands/index.ts
- [X] T038 [US4] Implement sideTabs.renameGroup command in src/commands/index.ts
- [X] T039 [US4] Implement sideTabs.deleteGroup command in src/commands/index.ts
- [X] T040 [US4] Implement sideTabs.toggleGroupCollapse command in src/commands/index.ts
- [X] T041 [US4] Update TabTreeProvider to return GroupItem with collapsibleState in src/providers/tabTreeProvider.ts
- [X] T042 [US4] Update TabTreeProvider getChildren to return tabs within groups in src/providers/tabTreeProvider.ts
- [X] T043 [US4] Update DragAndDropController to handle tab-to-group drops in src/providers/tabDragAndDropController.ts
- [X] T044 [US4] Implement auto-delete empty groups logic in src/services/persistenceService.ts
- [X] T045 [US4] Register group context menu items in package.json contributes.menus

**Checkpoint**: User Story 4 complete - full group management with drag-drop support

---

## Phase 7: User Story 5 - Appearance Customization (Priority: P5)

**Goal**: 自訂頁籤的字體大小和顏色

**Independent Test**: 在設定中修改字體大小，頁籤清單即時反映新的字體大小

### Implementation for User Story 5

- [x] T046 [US5] Add configuration schema to package.json: fontSize, errorColor, warningColor, showFileIcons, maxFileNameLength
- [x] T047 [US5] Create SettingsService to read configuration using workspace.getConfiguration in src/services/settingsService.ts
- [x] T048 [US5] Listen configuration changes using workspace.onDidChangeConfiguration in src/services/settingsService.ts
- [x] T049 [US5] Update TabDecorationProvider to use custom errorColor/warningColor in src/providers/tabDecorationProvider.ts
- [x] T050 [US5] Update TabTreeProvider to respect maxFileNameLength setting in src/providers/tabTreeProvider.ts
- [x] T051 [US5] Update TabTreeProvider to conditionally show file icons based on showFileIcons in src/providers/tabTreeProvider.ts

**Checkpoint**: User Story 5 complete - appearance is customizable via VS Code settings

---

## Phase 8: User Story 6 - File Path and Location (Priority: P6)

**Goal**: 查看檔案完整路徑並快速開啟檔案所在資料夾

**Independent Test**: 將滑鼠懸停在頁籤上顯示完整路徑 tooltip，右鍵選單可開啟檔案所在資料夾

### Implementation for User Story 6

- [x] T052 [US6] Implement FileService with revealInExplorer method in src/services/fileService.ts
- [x] T053 [US6] Implement copyPath and copyRelativePath methods in src/services/fileService.ts
- [x] T054 [US6] Implement sideTabs.revealInExplorer command in src/commands/index.ts
- [x] T055 [US6] Implement sideTabs.copyPath command in src/commands/index.ts
- [x] T056 [US6] Implement sideTabs.copyRelativePath command in src/commands/index.ts
- [x] T057 [US6] Implement sideTabs.closeTab command in src/commands/index.ts
- [x] T058 [US6] Register tab context menu items in package.json contributes.menus
- [x] T059 [US6] Ensure tooltip shows full path in TabTreeProvider in src/providers/tabTreeProvider.ts

**Checkpoint**: User Story 6 complete - file path viewing and location features work

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T060 [P] Implement path disambiguation for same-name files using pathUtils in src/providers/tabTreeProvider.ts
- [x] T061 [P] Add error handling and logging throughout services in src/services/
- [x] T062 [P] Code cleanup: ensure consistent naming and TypeScript strict compliance
- [x] T063 [P] Create README.md with installation and usage instructions
- [x] T064 Run quickstart.md validation checklist
- [x] T065 [P] Performance validation: test with 100+ tabs open

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1's TabTreeProvider
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Adds to US1's TreeView
- **User Story 4 (P4)**: Depends on US3 (PersistenceService) - Extends drag-drop functionality
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Extends US2's decorations
- **User Story 6 (P6)**: Can start after Foundational (Phase 2) - Independent commands

### Within Each User Story

- Models before services
- Services before providers
- Providers before commands
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- US1, US2, US3, US5, US6 can start in parallel after Foundational phase
- US4 should wait for US3's PersistenceService

---

## Parallel Example: Setup Phase

```bash
# Launch all parallel Setup tasks together:
Task: T002 "Create TypeScript configuration in tsconfig.json"
Task: T003 "Create VS Code launch configuration in .vscode/launch.json"
Task: T004 "Create VS Code tasks configuration in .vscode/tasks.json"
Task: T005 "Create project directory structure"
Task: T006 "Create tests directory structure"
Task: T007 "Create extension icon in resources/icon.svg"
```

## Parallel Example: Foundational Phase

```bash
# Launch all parallel Foundational tasks together:
Task: T010 "Create constants file in src/utils/constants.ts"
Task: T011 "Create path utilities in src/utils/pathUtils.ts"
Task: T013 "Create TabGroup interface in src/models/tabGroup.ts"
Task: T014 "Create TabState interface in src/models/tabState.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test vertical tab display and click-to-switch
5. Deploy/demo if ready - basic vertical tabs work!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (status indicators)
4. Add User Story 3 → Test independently → Deploy/Demo (drag-drop sorting)
5. Add User Story 4 → Test independently → Deploy/Demo (grouping)
6. Add User Story 5 → Test independently → Deploy/Demo (customization)
7. Add User Story 6 → Test independently → Deploy/Demo (path features)
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (MVP)
   - Developer B: User Story 2 (status) - after A completes US1 base
   - Developer C: User Story 6 (paths) - independent
3. After US1 complete:
   - Developer A: User Story 3 (drag-drop)
   - Developer B: User Story 5 (appearance)
4. After US3 complete:
   - Developer A: User Story 4 (groups)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- VS Code TreeView API has styling limitations - research.md notes potential Webview upgrade for fontSize
- All persistence uses workspaceState (workspace-specific settings)
