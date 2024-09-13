import * as vscode from 'vscode';
import { FileTrayProvider, FileItem } from './fileTrayView';

export function activate(context: vscode.ExtensionContext) {
  const fileTrayProvider = new FileTrayProvider(context.globalState);
  vscode.window.registerTreeDataProvider('fileTrayView', fileTrayProvider);
  vscode.window.createTreeView('fileTrayView', { // Tree View ID
    treeDataProvider: fileTrayProvider,
    dragAndDropController: fileTrayProvider,
    showCollapseAll: false
  });
  



  let addFileDisposable = vscode.commands.registerCommand('fileTray.addFile', async () => {
    const fileUri = await vscode.window.showOpenDialog({
      canSelectMany: false,
      openLabel: 'Add File to Tray'
    });
    if (fileUri && fileUri[0]) {
      fileTrayProvider.addFile(fileUri[0].fsPath);
    }
  });

  let removeFileDisposable = vscode.commands.registerCommand('fileTray.removeFile', (file: FileItem) => {
    fileTrayProvider.removeFile(file);
  });

  let copyContentDisposable = vscode.commands.registerCommand('fileTray.copyFileContent', async (file: FileItem) => {
	const content = await vscode.workspace.fs.readFile(file.resourceUri!);
	await vscode.env.clipboard.writeText(content.toString());
	vscode.window.showInformationMessage('File content copied to clipboard!');
  });
  
  context.subscriptions.push(copyContentDisposable);
  context.subscriptions.push(addFileDisposable);
  context.subscriptions.push(removeFileDisposable);
}
