/* eslint-disable @typescript-eslint/restrict-template-expressions */
import * as vscode from "vscode";
import { getNonce } from "./utils";

export class AreaGitEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new AreaGitEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(AreaGitEditorProvider.viewType, provider);
    return providerRegistration;
  }

  private static readonly viewType = "sinfar.areaGitEditor";
  private readonly _context: vscode.ExtensionContext;
  private static readonly scratchCharacters = ["😸", "😹", "😺", "😻", "😼", "😽", "😾", "🙀", "😿", "🐱"];

  constructor(private readonly context: vscode.ExtensionContext) {
    this._context = context;
  }

  /**
   * Called when our custom editor is opened.
   *
   *
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
      switch (e.type) {
        case "add":
          void this.addNewScratch(document);
          return;

        case "delete":
          void this.deleteScratch(document, e.id);
      }
    });

    void updateWebview();
  }

  /**
   * Get the static html used for the editor webviews.
   */
  private getHtmlForWebview(webview: vscode.Webview): string {
    // Local path to script and css for the webview
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "client", "media", "catScratch.js"));

    const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "client", "media", "reset.css"));

    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, "client", "media", "vscode.css"));

    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "client", "media", "catScratch.css"),
    );

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    return /* html */ `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
			</head>
			<body>
				<div id="page_body_wrapper">
<div id="main_table_container">
	<h3 id="page_title">atsm_up_halls.git</h3>
	<table id="main_table" class="game_structure">
<div id="page_footer_wrapper" class="sinfar_border">
	<div style="margin-left:3px;position:relative;top: 50%;transform: translateY(-50%);">
		<label id="res_git_log">Log:<input type="text"></label>
		<input type="button" value="Save" id="res_save">
		&nbsp;
		<span id="res_save_result"></span>
	</div>
</div>
</div>
			</body>
			</html>`;
  }

  /**
   * Add a new scratch to the current document.
   */
  private addNewScratch(document: vscode.TextDocument) {
    const json = this.getDocumentAsJson(document);
    const character =
      AreaGitEditorProvider.scratchCharacters[Math.floor(Math.random() * AreaGitEditorProvider.scratchCharacters.length)];
    json.scratches = [
      ...(Array.isArray(json.scratches) ? json.scratches : []),
      {
        id: getNonce(),
        text: character,
        created: Date.now(),
      },
    ];

    return this.updateTextDocument(document, json);
  }

  /**
   * Delete an existing scratch from a document.
   */
  private deleteScratch(document: vscode.TextDocument, id: string) {
    const json = this.getDocumentAsJson(document);
    if (!Array.isArray(json.scratches)) {
      return;
    }

    json.scratches = json.scratches.filter((note: any) => note.id !== id);

    return this.updateTextDocument(document, json);
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
