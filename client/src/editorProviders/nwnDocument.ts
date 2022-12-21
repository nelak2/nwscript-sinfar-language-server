/* eslint-disable @typescript-eslint/no-misused-promises */
import * as vscode from "vscode";
import { Disposable } from "./disposable";
import { ERF } from "../api/types";

export type NWNEdit = {
  readonly field: string;
  readonly newValue: string;
  readonly oldValue: string;
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

  public get edits(): Array<NWNEdit> {
    return this._edits;
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
   * @param type is the type of change
   * @param field is the field that was changed
   * @param newValue is the new value of the field
   * @param oldValue is the old value of the field
   * @param content is the entire document (only used for revert)
   * @param edits is the list of edits (only used for revert)
   * @param origin is the originating webview (to prevent infinite loops)
   */
  private readonly _onDidChangeDocument = this._register(
    new vscode.EventEmitter<{
      readonly type: string;
      readonly field?: string;
      readonly newValue?: string;
      readonly oldValue?: string;
      readonly edits?: Array<NWNEdit>;
      readonly origin?: vscode.Webview;
      readonly content?: any;
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

  /**
   * Apply edits to the document and trigger events
   * @param edit is the edit to make
   * @param origin originating webpanel to prevent infinite loops
   */
  makeEdit(edit: NWNEdit, origin?: vscode.Webview): void {
    this._edits.push(edit);

    if (origin) {
      this._onDidChangeDocument.fire({
        type: "update",
        field: edit.field,
        newValue: edit.newValue,
        oldValue: edit.oldValue,
        origin,
      });
    }

    this._onDidChange.fire({
      label: "Edit",
      undo: async () => {
        const previous = this._edits.pop();
        if (!previous) return;
        this._onDidChangeDocument.fire({
          type: "undo",
          field: previous.field,
          newValue: previous.oldValue,
          oldValue: previous.newValue,
        });
      },
      redo: async () => {
        this._edits.push(edit);
        this._onDidChangeDocument.fire({
          type: "redo",
          field: edit.field,
          newValue: edit.newValue,
          oldValue: edit.oldValue,
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
      type: "revert",
      content: diskContent,
      edits: this._edits,
    });
  }

  async backup(destination: vscode.Uri, cancellation: vscode.CancellationToken): Promise<vscode.CustomDocumentBackup> {
    await this.saveAs(destination, cancellation);

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
