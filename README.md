<!-- @format -->

# SideTabs - Vertical Tabs for VS Code

A VS Code extension for displaying open files as vertical tabs in a sidebar, with support for file status indicators, drag-and-drop organization, grouping, and customization.

## Features

### Core Functionality
- **Vertical Tab Display**: View all open files as a vertical list in the activity sidebar
- **Click to Switch**: Click any tab to open that file
- **File Status Indicators**: Visual indicators for unsaved changes and diagnostic issues (errors/warnings)
- **File Path Visibility**: Hover over tabs to see full file paths; copy full or relative paths via right-click menu

### Organization
- **Drag and Drop Sorting**: Reorder tabs by dragging them to new positions
- **Tab Grouping**: Create custom groups to organize related files
- **Persistent Organization**: Tab order and group assignments are saved and restored
- **Group Management**: Rename, delete, and collapse/expand groups

### Customization
- **Font Size**: Adjust tab label font size (8-24px)
- **File Name Truncation**: Set maximum file name display length
- **File Icons**: Toggle file type icons on/off
- **Diagnostic Colors**: Customize colors for error and warning indicators
- **Sort Mode**: Choose between manual, alphabetical, or recently-used sorting

## Installation

1. Install the extension from the VS Code Marketplace (or build from source)
2. Reload VS Code
3. The "Vertical Tabs" panel will appear in the activity sidebar

## Usage

### Viewing Tabs
- Open the "Vertical Tabs" panel from the sidebar
- All open files appear as a vertical list
- Click any tab to switch to that file
- Hover over tabs to see the full file path

### Managing Files
**Right-click menu options:**
- **Close Tab**: Close the file
- **Reveal in File Explorer**: Open the file's folder in your file explorer
- **Copy Path**: Copy the full file path to clipboard
- **Copy Relative Path**: Copy the path relative to your workspace root

### Organizing Tabs
**Drag and Drop:**
- Drag a tab to reorder it
- Drag a tab onto a group to move it
- Drag a tab out of a group to ungroup it

**Grouping:**
- Click the **+** button in the tab panel header to create a new group
- Right-click a group to rename or delete it
- Click the arrow to collapse/expand a group

### Configuration

Open VS Code Settings and search for "SideTabs":

- **Font Size**: Label font size in pixels (default: 13px)
- **Max File Name Length**: Maximum characters before truncation (default: 30)
- **Show File Icons**: Display file type icons (default: on)
- **Error Color**: Color for tabs with errors (default: #f14c4c)
- **Warning Color**: Color for tabs with warnings (default: #cca700)
- **Sort Mode**: Default tab sorting method (default: manual)

## Performance

- Efficiently handles 100+ open tabs
- <50ms response time for tab operations
- Minimal memory overhead
- Real-time synchronization with VS Code's tab state

## Keyboard Shortcuts

All commands are available through the command palette (`Ctrl/Cmd+Shift+P`):

- `sideTabs.openTab` - Open selected tab
- `sideTabs.closeTab` - Close selected tab
- `sideTabs.createGroup` - Create new tab group
- `sideTabs.renameGroup` - Rename group
- `sideTabs.deleteGroup` - Delete group
- `sideTabs.revealInExplorer` - Reveal file location
- `sideTabs.copyPath` - Copy full file path
- `sideTabs.copyRelativePath` - Copy relative path

## Data & Privacy

All extension data (tab order, groups) is stored locally in your VS Code workspace state. No data is sent to external servers.

## Requirements

- VS Code 1.85.0 or later
- TypeScript 5.0+ (for development)

## Development

### Setup
```bash
npm install
npm run compile    # Compile TypeScript
npm run watch      # Watch mode
npm run lint       # Check code style
npm test           # Run tests
```

### Build Structure
```
src/
├── extension.ts         # Entry point
├── models/              # Data models (Tab, TabGroup)
├── services/            # Business logic (TabSync, Diagnostics, etc.)
├── providers/           # VS Code providers (TreeDataProvider, etc.)
├── commands/            # Command handlers
└── utils/               # Utilities (constants, path helpers)
```

### Architecture

**Services:**
- `TabSyncService`: Synchronizes VS Code tabs with internal state
- `DiagnosticService`: Tracks file diagnostic status
- `SettingsService`: Manages extension settings
- `PersistenceService`: Handles workspace state storage
- `FileService`: File operations (copy path, reveal in explorer)

**Providers:**
- `TabTreeProvider`: TreeDataProvider for the tab panel
- `TabDecorationProvider`: File decoration for errors/warnings
- `TabDragAndDropController`: Handles drag-and-drop operations

## Contributing

Contributions are welcome! Please ensure:
- Code follows TypeScript strict mode
- All changes compile without errors
- Performance impact is minimal
- Features are well-documented

## License

See LICENSE file for details.

## Support

For issues, feature requests, or questions, please open an issue on the GitHub repository.
