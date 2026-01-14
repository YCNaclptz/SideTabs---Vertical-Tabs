<!-- @format -->

# Implementation Plan: Vertical Tabs Sidebar

**Branch**: `001-vertical-tabs` | **Date**: 2026-01-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-vertical-tabs/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

開發 VS Code 擴充功能，在側邊欄以垂直方式顯示開啟的檔案頁籤。核心功能包括：頁籤同步顯示、檔案狀態指示（錯誤/警告顏色、未儲存斜體）、拖曳排序、自訂群組、外觀設定、檔案路徑查看與開啟位置。使用 VS Code Extension API 的 TreeView 實作，透過 Webview 或 TreeDataProvider 提供自訂渲染。

## Technical Context

**Language/Version**: TypeScript 5.x (VS Code extension requirement)
**Primary Dependencies**: @types/vscode, VS Code Extension API (TreeView, DiagnosticsCollection, WorkspaceState)
**Storage**: VS Code WorkspaceState/GlobalState for persistence (JSON)
**Testing**: Jest + @vscode/test-electron for extension testing
**Target Platform**: VS Code 1.85+ (all platforms: Windows, macOS, Linux)
**Project Type**: Single project (VS Code extension)
**Performance Goals**: <100ms tab switch, <200ms list update, 60fps scroll with 200+ tabs
**Constraints**: <20MB memory increase, no external network calls, pure local storage
**Scale/Scope**: Support 200+ open tabs, unlimited groups

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Tab Management Focus**: Feature directly enhances tab organization, navigation, or productivity
  - ✅ 核心功能是頁籤管理，完全符合
- [x] **Performance Requirements**: Target <100ms response time, <50MB memory impact documented
  - ✅ 已定義 <100ms 回應、<20MB 記憶體目標
- [x] **Data Privacy**: Local data storage plan defined, no analytics without explicit consent
  - ✅ 僅使用 VS Code WorkspaceState，完全本地
- [x] **Accessibility**: WCAG 2.1 AA compliance plan, keyboard navigation design included
  - ✅ 使用原生 TreeView 支援鍵盤導航和螢幕閱讀器
- [x] **Browser Compatibility**: Chrome, Firefox, Safari, Edge compatibility confirmed or fallbacks planned
  - ⚠️ N/A - 這是 VS Code extension，非瀏覽器擴充功能（憲章條款針對瀏覽器，此為 VS Code）

## Project Structure

### Documentation (this feature)

```text
specs/001-vertical-tabs/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── extension.ts         # Extension entry point, activation
├── providers/
│   └── tabTreeProvider.ts    # TreeDataProvider implementation
├── models/
│   ├── tab.ts           # Tab data model
│   ├── tabGroup.ts      # TabGroup data model
│   └── tabState.ts      # State management
├── services/
│   ├── tabSyncService.ts     # VS Code tab sync
│   ├── diagnosticService.ts  # Diagnostic listener
│   ├── persistenceService.ts # State persistence
│   └── fileService.ts        # File operations (reveal, copy path)
├── commands/
│   └── index.ts         # Command registrations
└── utils/
    ├── pathUtils.ts     # Path disambiguation
    └── constants.ts     # Configuration keys

tests/
├── unit/
│   ├── models/
│   └── services/
└── integration/
    └── extension.test.ts
```

**Structure Decision**: 使用 VS Code extension 標準結構，providers/ 放置 TreeDataProvider，models/ 放置資料模型，services/ 處理業務邏輯與 VS Code API 整合。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed                       | Simpler Alternative Rejected Because          |
| -------------------------- | -------------------------------- | --------------------------------------------- |
| Browser Compatibility N/A  | VS Code extension 不在瀏覽器運行 | 憲章條款針對瀏覽器擴充功能，此為 IDE 擴充功能 |
| [e.g., Repository pattern] | [specific problem]               | [why direct DB access insufficient]           |
