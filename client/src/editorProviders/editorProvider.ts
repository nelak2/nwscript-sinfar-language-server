import * as vscode from "vscode";
import { disposeAll } from "./disposable";
import { NWNDocument } from "./nwnDocument";
import { getUri } from "./utils";
import { WebviewCollection } from "./webviewCollection";
import fs from "fs";

export class EditorProvider implements vscode.CustomEditorProvider<NWNDocument> {
  private static readonly viewType = "sinfar.areaGitEditor";
  // tracks all known webviews
  private readonly webviews = new WebviewCollection();
  private readonly context: vscode.ExtensionContext;

  constructor(private readonly _context: vscode.ExtensionContext) {
    this.context = _context;
  }

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    vscode.commands.registerCommand("sinfar.git.new", () => {
      void vscode.window.showErrorMessage("Cannot create new areas in VS Code. Import them from the NWN Toolset");
    });

    return vscode.window.registerCustomEditorProvider(EditorProvider.viewType, new EditorProvider(context), {
      webviewOptions: {
        retainContextWhenHidden: false,
        enableFindWidget: true,
      },
      supportsMultipleEditorsPerDocument: true,
    });
  }

  // #region CustomEditorProvider

  async openCustomDocument(
    uri: vscode.Uri,
    openContext: { backupId?: string },
    _token: vscode.CancellationToken,
  ): Promise<NWNDocument> {
    const document: NWNDocument = await NWNDocument.create(uri, openContext.backupId, {
      getFileData: async () => {
        const webviewsForDocument = Array.from(this.webviews.get(document.uri));
        if (!webviewsForDocument.length) {
          throw new Error("Could not find webview for document");
        }

        const panel = webviewsForDocument[0];
        const response = await this.postMessageWithResponse<any>(panel, "getFileData", {});
        return response;
      },
    });

    const listeners: vscode.Disposable[] = [];

    listeners.push(
      document.onDidChange((e) => {
        // Tell VS Code that the document has been edited by the use.
        this._onDidChangeCustomDocument.fire({
          document,
          ...e,
        });
      }),
    );

    listeners.push(
      document.onDidChangeContent((e) => {
        // Update all webviews when we receive a undo/redo event
        for (const webviewPanel of this.webviews.get(document.uri)) {
          if (e.origin && e.origin === webviewPanel.webview) {
            // skip the origin of the event
            continue;
          }
          void webviewPanel.webview.postMessage({
            type: e.type,
            field: e.field,
            newValue: e.newValue,
            oldValue: e.oldValue,
          });
        }
      }),
    );

    document.onDidDispose(() => disposeAll(listeners));

    return document;
  }

  async resolveCustomEditor(
    document: NWNDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken,
  ): Promise<void> {
    // Add the webview to our internal set of active webviews
    this.webviews.add(document.uri, webviewPanel);

    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = await this.getHtmlForWebview(webviewPanel.webview);

    // callback used for getFileData
    let callback: any;

    // Wait for the webview to be properly ready before we init
    webviewPanel.webview.onDidReceiveMessage((message) => {
      switch (message.type) {
        case "ready":
          void webviewPanel.webview.postMessage({ type: "init", content: document.documentData, edits: document.edits });
          break;
        case "update":
          // update document and edits array
          document.makeEdit(
            {
              field: message.field,
              newValue: message.newValue,
              oldValue: message.oldValue,
            },
            webviewPanel.webview,
          );
          break;
        case "getFileData":
          callback = this._callbacks.get(message.requestId);
          callback?.(message.content);
          break;
        case "alert":
          void vscode.window.showErrorMessage(message.content);
          break;
      }
    });
  }

  private readonly _onDidChangeCustomDocument = new vscode.EventEmitter<vscode.CustomDocumentEditEvent<NWNDocument>>();
  public readonly onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;

  public saveCustomDocument(document: NWNDocument, cancellation: vscode.CancellationToken): Thenable<void> {
    return document.save(cancellation);
  }

  public saveCustomDocumentAs(
    document: NWNDocument,
    destination: vscode.Uri,
    cancellation: vscode.CancellationToken,
  ): Thenable<void> {
    return document.saveAs(destination, cancellation);
  }

  public revertCustomDocument(document: NWNDocument, cancellation: vscode.CancellationToken): Thenable<void> {
    return document.revert(cancellation);
  }

  public backupCustomDocument(
    document: NWNDocument,
    context: vscode.CustomDocumentBackupContext,
    cancellation: vscode.CancellationToken,
  ): Thenable<vscode.CustomDocumentBackup> {
    return document.backup(context.destination, cancellation);
  }

  // #endregion

  /**
   * Get the static HTML used for in our editor's webviews.
   */
  private async getHtmlForWebview(webview: vscode.Webview): Promise<string> {
    const toolkitUri = getUri(webview, this.context.extensionUri, [
      "client",
      "node_modules",
      "@vscode",
      "webview-ui-toolkit",
      "dist",
      "toolkit.js",
    ]);

    const cssUri = getUri(webview, this.context.extensionUri, ["client", "src", "editors", "styles.css"]);
    const mainUri = getUri(webview, this.context.extensionUri, ["client", "out", "gitEditor.js"]);
    const htmlUri = getUri(webview, this.context.extensionUri, ["client", "src", "editors", "git", "gitEditor.html"]);
    const codiconsUri = getUri(webview, this.context.extensionUri, [
      "client",
      "node_modules",
      "@vscode/codicons",
      "dist",
      "codicon.css",
    ]);

    const css = fs.readFileSync(cssUri.fsPath, "utf8");

    const html = fs
      .readFileSync(htmlUri.fsPath, "utf8")
      .replace(/\${toolkitUri}/g, toolkitUri.toString())
      .replace(/\${mainUri}/g, mainUri.toString())
      .replace(/\${codiconsUri}/g, codiconsUri.toString())
      .replace(/\/\*\${style}\*\//, css);
    return html;
  }

  private _requestId = 1;
  private readonly _callbacks = new Map<number, (response: any) => void>();

  private async postMessageWithResponse<R = unknown>(panel: vscode.WebviewPanel, type: string, body: any): Promise<R> {
    const requestId = this._requestId++;
    const p = new Promise<R>((resolve) => this._callbacks.set(requestId, resolve));
    void panel.webview.postMessage({ type, requestId, body });
    return await p;
  }
}
