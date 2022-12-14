/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as vscode from "vscode";
import { getNonce, getUri } from "./utils";
import fs from "fs";

export class GitEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new GitEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(GitEditorProvider.viewType, provider);
    return providerRegistration;
  }

  private static readonly viewType = "sinfar.areaGitEditor";
  private readonly _context: vscode.ExtensionContext;

  constructor(private readonly context: vscode.ExtensionContext) {
    this._context = context;
  }

  /**
   * Called when our custom editor is opened.
   */
  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken,
  ): Promise<void> {
    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    async function updateWebview() {
      void webviewPanel.webview.postMessage({
        type: "update",
        text: document.getText(),
      });
    }

    // Hook up event handlers so that we can synchronize the webview with the text document.
    //
    // The text document acts as our model, so we have to sync change in the document to our
    // editor and sync changes in the editor back to the document.
    //
    // Remember that a single text document can also be shared between multiple custom
    // editors (this happens for example when you split a custom editor)

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(async (e) => {
      if (e.document.uri.toString() === document.uri.toString()) {
        void updateWebview();
      }
    });

    // Make sure we get rid of the listener when our editor is closed.
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage(async (e) => {
      switch (e.command) {
        case "test":
          void webviewPanel.webview.postMessage({
            type: "update",
            text: document.getText(),
          });
          break;
        // case "getScriptFields":
        //   void webviewPanel.webview.postMessage({
        //     type: "scriptFields",
        //     scriptFields: this._resourcesAPI.getScriptFields(e.text),
        //   });
        //   break;
      }
    });

    void updateWebview();
  }

  /**
   * Get the static html used for the editor webviews.
   */
  private getHtmlForWebview(webview: vscode.Webview): string {
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

  /**
   * Try to get a current document as json text.
   */
  private getDocumentAsJson(document: vscode.TextDocument): any {
    const text = document.getText();
    if (text.trim().length === 0) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Could not get document as json. Content is not valid json");
    }
  }

  /**
   * Write out the json to a given document.
   */
  private updateTextDocument(document: vscode.TextDocument, json: any) {
    const edit = new vscode.WorkspaceEdit();

    // Just replace the entire document every time for this example extension.
    // A more complete extension should compute minimal edits instead.
    edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), JSON.stringify(json, null, 2));

    return vscode.workspace.applyEdit(edit);
  }
}
