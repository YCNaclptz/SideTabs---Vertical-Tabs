
jest.mock('vscode', () => {
    const mockEventEmitter = {
        event: jest.fn(),
        fire: jest.fn(),
        dispose: jest.fn(),
    };

    return {
        window: {
            tabGroups: {
                all: [],
                onDidChangeTabs: jest.fn(() => ({ dispose: jest.fn() })),
            },
        },
        TabInputText: class {
            constructor(public uri: any) {}
        },
        Uri: {
            file: (path: string) => ({ fsPath: path, toString: () => 'file://' + path }),
            parse: (path: string) => ({ fsPath: path, toString: () => path }),
        },
        EventEmitter: jest.fn(() => mockEventEmitter),
        Disposable: {
            from: jest.fn(),
        },
    };
}, { virtual: true });

import * as vscode from 'vscode';
import { TabSyncService } from '../../../src/services/tabSyncService';

describe('TabSyncService', () => {
    let service: TabSyncService;
    let mockPersistenceService: any;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Setup mock persistence service
        mockPersistenceService = {
            getTabSortOrder: jest.fn().mockReturnValue(0),
            getTabGroupId: jest.fn().mockReturnValue(null),
        };

        // Setup mock tabs in vscode
        (vscode.window.tabGroups as any).all = [
            {
                tabs: [
                    {
                        input: new vscode.TabInputText(vscode.Uri.file('/path/to/file1.txt')),
                        label: 'file1.txt',
                        group: { viewColumn: 1 }
                    },
                    {
                        input: new vscode.TabInputText(vscode.Uri.file('/path/to/file2.txt')),
                        label: 'file2.txt',
                        group: { viewColumn: 1 }
                    }
                ],
                viewColumn: 1
            }
        ];
    });

    test('should respect persistence service sort order', () => {
        service = new TabSyncService();
        service.setPersistenceService(mockPersistenceService);

        // Define expected sort orders
        mockPersistenceService.getTabSortOrder.mockImplementation((id: string) => {
            if (id.includes('file1.txt')) return 10;
            if (id.includes('file2.txt')) return 5;
            return 0;
        });

        // Trigger sync
        service.syncTabs();

        const tabs = service.getTabs();
        const tab1 = tabs.find(t => t.uri.fsPath.includes('file1.txt'));
        const tab2 = tabs.find(t => t.uri.fsPath.includes('file2.txt'));

        expect(tab1).toBeDefined();
        expect(tab2).toBeDefined();
        expect(tab1?.sortOrder).toBe(10);
        expect(tab2?.sortOrder).toBe(5);
    });

    test('should update sort order when persistence changes and sync is called', () => {
        service = new TabSyncService();
        service.setPersistenceService(mockPersistenceService);

        // Initial sync
        service.syncTabs();
        let tabs = service.getTabs();
        let tab1 = tabs.find(t => t.uri.fsPath.includes('file1.txt'));
        expect(tab1?.sortOrder).toBe(0);

        // Change persistence
        mockPersistenceService.getTabSortOrder.mockImplementation((id: string) => {
            if (id.includes('file1.txt')) return 99;
            return 0;
        });

        // Sync again
        service.syncTabs();
        
        tabs = service.getTabs();
        tab1 = tabs.find(t => t.uri.fsPath.includes('file1.txt'));
        expect(tab1?.sortOrder).toBe(99);
    });
});
