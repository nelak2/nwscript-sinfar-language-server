/* eslint-disable @typescript-eslint/no-misused-promises */
import * as vscode from "vscode";
import { Disposable } from "./disposable";
import * as path from "path";
import { ERF } from "../api/types";

export type NWNEdit = {
  readonly field: string;
  readonly value: string;
};

type NWNDocumentDelegate = {
  getFileData: () => Promise<any>;
};

export class NWNDocument extends Disposable implements vscode.CustomDocument {
  private readonly _uri: vscode.Uri;
  private _documentData: any;
  private _edits: Array<NWNEdit> = [];
  private _savedEdits: Array<NWNEdit> = [];
  private readonly _delegate: NWNDocumentDelegate;

  private constructor(uri: vscode.Uri, initialContent: ERF, delegate: NWNDocumentDelegate) {
    super();
    this._uri = uri;
    this._documentData = initialContent;
    this._delegate = delegate;
  }

  static async create(
    uri: vscode.Uri,
    backupId: string | undefined,
    delegate: NWNDocumentDelegate,
  ): Promise<NWNDocument | PromiseLike<NWNDocument>> {
    // if we have a backup read that otherwise read the resource from the workspace
    const dataFile = typeof backupId === "string" ? vscode.Uri.parse(backupId) : uri;
    const content = await NWNDocument.readFile(dataFile);
    return new NWNDocument(uri, content, delegate);
  }

  // Return the parsed JSON object
  private static async readFile(uri: vscode.Uri): Promise<any> {
    if (uri.scheme === "untitled") {
      return {};
    }
    const rawData = await vscode.workspace.fs.readFile(uri);
    const decoder = new TextDecoder();
    try {
      const jsonData = JSON.parse(decoder.decode(rawData));
      return jsonData;
    } catch (e) {
      console.log(e);
      return {};
    }
  }

  public get uri() {
    return this._uri;
  }

  public get documentData(): any {
    return this._documentData;
  }

  /**
   * Handle disposal events
   */

  private readonly _onDidDispose = this._register(new vscode.EventEmitter<void>());

  public readonly onDidDispose = this._onDidDispose.event;

  dipose(): void {
    this._onDidDispose.fire();
    super.dispose();
  }

  /**
   * Handle document change events
   */
  private readonly _onDidChangeDocument = this._register(
    new vscode.EventEmitter<{
      readonly content?: string;
      readonly edits: readonly NWNEdit[];
    }>(),
  );

  public readonly onDidChangeContent = this._onDidChangeDocument.event;

  private readonly _onDidChange = this._register(
    new vscode.EventEmitter<{
      readonly label: string;
      undo: () => void;
      redo: () => void;
    }>(),
  );

  public readonly onDidChange = this._onDidChange.event;

  makeEdit(edit: NWNEdit) {
    this._edits.push(edit);

    this._onDidChange.fire({
      label: "Edit",
      undo: async () => {
        this._edits.pop();
        this._onDidChangeDocument.fire({
          edits: this._edits,
        });
      },
      redo: async () => {
        this._edits.push(edit);
        this._onDidChangeDocument.fire({
          edits: this._edits,
        });
      },
    });
  }

  // Save document
  async save(cancellation: vscode.CancellationToken): Promise<void> {
    await this.saveAs(this.uri, cancellation);
    this._savedEdits = Array.from(this._edits);
  }

  // Ensure the json data is stringified and encoded before writing to disk or the server
  async saveAs(targetResource: vscode.Uri, cancellation: vscode.CancellationToken): Promise<void> {
    const fileData = await this._delegate.getFileData();
    if (cancellation.isCancellationRequested) {
      return;
    }
    const stringify = JSON.stringify(fileData);
    const encoder = new TextEncoder();

    await vscode.workspace.fs.writeFile(targetResource, encoder.encode(stringify));
  }

  // refetch document from the server
  async revert(_cancellation: vscode.CancellationToken): Promise<void> {
    const diskContent = await NWNDocument.readFile(this.uri);
    this._documentData = diskContent;
    this._edits = this._savedEdits;
    this._onDidChangeDocument.fire({
      content: diskContent,
      edits: this._edits,
    });
  }

  // backup the edited document
  // used by vscode to implement hot exit (exiting without saving)
  async backup(destination: vscode.Uri, cancellation: vscode.CancellationToken): Promise<vscode.CustomDocumentBackup> {
    // save file locally rather than to the server
    const extensionPath = vscode.extensions.getExtension("NelaK.nwscript-sinfar-scripters-extension")?.extensionPath;
    if (!extensionPath) {
      console.log("Extension path not found");
      return { id: destination.toString(), delete: async () => {} };
    }

    const localCachePath = vscode.Uri.file(`${extensionPath}/localCache/${path.parse(destination.fsPath).base}`);

    await this.saveAs(localCachePath, cancellation);

    return {
      id: destination.toString(),
      delete: async () => {
        try {
          await vscode.workspace.fs.delete(destination);
        } catch {
          // noop
        }
      },
    };
  }
}
