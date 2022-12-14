import path, { join } from "path";
import { readFileSync } from "fs";
import { TextDocument } from "vscode-languageserver-textdocument";

import type { Tokenizer } from "../Tokenizer";
import type { ComplexToken } from "../Tokenizer/types";
import { GlobalScopeTokenizationResult, TokenizedScope } from "../Tokenizer/Tokenizer";
import { Dictionnary } from "../Utils";
import Document from "./Document";
import { SinfarAPI } from "../VirtualFileSystem/sinfarAPI";

export default class DocumentsCollection extends Dictionnary<string, Document> {
  public readonly standardLibComplexTokens: ComplexToken[] = [];
  public sinfarApi: SinfarAPI;
  public tokenizer: Tokenizer | null = null;

  constructor(sinfarAPI: SinfarAPI) {
    super();

    this.sinfarApi = sinfarAPI;

    this.standardLibComplexTokens = JSON.parse(
      readFileSync(join(__dirname, "..", "resources", "standardLibDefinitions.json")).toString(),
    ).complexTokens as ComplexToken[];
  }

  private addDocument(document: Document) {
    this.add(document.getKey(), document);
  }

  private overwriteDocument(document: Document) {
    this.overwrite(document.getKey(), document);
  }

  private initializeDocument(uri: string, globalScope: GlobalScopeTokenizationResult) {
    return new Document(uri, globalScope.children, globalScope.complexTokens, globalScope.structComplexTokens, this);
  }

  public getKey(uri: string) {
    return path.parse(uri).name;
  }

  public async getFromUri(uri: string): Promise<Document> {
    return await this.get(this.getKey(uri));
  }

  public createDocument(uri: string, globalScope: GlobalScopeTokenizationResult) {
    this.addDocument(this.initializeDocument(uri, globalScope));
  }

  public updateDocument(document: TextDocument, tokenizer: Tokenizer) {
    const globalScope = tokenizer.tokenizeContent(document.getText(), TokenizedScope.global);

    this.overwriteDocument(this.initializeDocument(document.uri, globalScope));
  }

  // Prevent duplicate reads of the same file
  private _readLock: boolean = false;
  private async _getReadLock(): Promise<void> {
    if (!this._readLock) {
      this._readLock = true;
    } else {
      while (this._readLock) {
        // eslint-disable-next-line promise/param-names
        await new Promise((f) => setTimeout(f, 50));
      }
    }
  }

  // Override default dictionary get() to handle file requests when the file is not in the collection
  public async get(key: string): Promise<Document> {
    try {
      await this._getReadLock();

      if (this.exist(key)) {
        return this._get(key) as Document;
      }

      if (!this.tokenizer) {
        throw new Error("Tokenizer is not initialized");
      }

      const file = await this.sinfarApi.getFile(key);
      const globalScope = this.tokenizer.tokenizeContent(file.content, TokenizedScope.global);
      const document = this.initializeDocument(file.uri.toString(), globalScope);
      this.overwriteDocument(document);
      return document;
    } finally {
      this._readLock = false;
    }
  }

  public getLocalOnly(key: string): Document {
    return this._get(key) as Document;
  }
}
