import * as vscode from 'vscode';

export class FileTrayProvider implements vscode.TreeDataProvider<FileItem>, vscode.TreeDragAndDropController<FileItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | void> = new vscode.EventEmitter<FileItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | void> = this._onDidChangeTreeData.event;

    private files: FileItem[] = [];

    constructor(private globalState: vscode.Memento) {
        // Load persisted files
        const savedFiles = globalState.get<string[]>('fileTray', []);
        this.files = savedFiles.map(path => new FileItem(path));
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
        // Persist the file list
        this.globalState.update('fileTray', this.files.map(f => f.resourceUri!.fsPath));
    }

    getTreeItem(element: FileItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: FileItem): Thenable<FileItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            return Promise.resolve(this.files);
        }
    }

    addFile(filePath: string) {
        this.files.push(new FileItem(filePath));
        this.refresh();
    }

    removeFile(file: FileItem) {
        this.files = this.files.filter(f => f !== file);
        this.refresh();
    }

    dropMimeTypes = ['text/uri-list'];
    dragMimeTypes = ['text/uri-list'];

    handleDrag(source: FileItem[], dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): void | Thenable<void> {
        const uris = source.map(item => item.resourceUri!);
        dataTransfer.set('text/uri-list', new vscode.DataTransferItem(uris.map(uri => uri.toString()).join('\n')));
    }

    handleDrop(target: FileItem | undefined, dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): void | Thenable<void> {
        // Handle files dropped into the tray (optional)
    }
}

export class FileItem extends vscode.TreeItem {
    constructor(public readonly filePath: string) {
        super(vscode.Uri.file(filePath), vscode.TreeItemCollapsibleState.None);
        this.tooltip = this.filePath;
        this.description = this.filePath;
        this.resourceUri = vscode.Uri.file(filePath);
        this.contextValue = 'fileItem';
    }
}
