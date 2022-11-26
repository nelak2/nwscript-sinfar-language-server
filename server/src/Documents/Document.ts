import type { ComplexToken, StructComplexToken } from "../Tokenizer/types";
import type DocumentsCollection from "./DocumentsCollection";

export type OwnedComplexTokens = { owner: string; tokens: ComplexToken[] };
export type OwnedStructComplexTokens = { owner: string; tokens: StructComplexToken[] };

export default class Document {
  constructor(
    readonly uri: string,
    readonly children: string[],
    readonly complexTokens: ComplexToken[],
    readonly structComplexTokens: StructComplexToken[],
    private readonly collection: DocumentsCollection,
  ) {}

  public getKey() {
    return this.collection.getKey(this.uri);
  }

  public async getChildren(computedChildren: string[] = []): Promise<string[]> {
    const output = await Promise.all(
      this.children.flatMap(async (child) => {
        // Cycling children or/and duplicates
        if (computedChildren.includes(child)) {
          return [];
        } else {
          computedChildren.push(child);
        }

        const childDocument = await this.collection.get(child);

        if (!childDocument) {
          return [];
        }

        return await childDocument.getChildren(computedChildren);
      }),
    );

    return this.children.concat(output.flat());
  }

  public async getGlobalComplexTokensWithRef(computedChildren: string[] = []): Promise<OwnedComplexTokens[]> {
    const localStandardLibDefinitions = this.collection.getLocalOnly("nwscript");

    const tokens = await Promise.all(
      this.children.flatMap(async (child) => {
        // Cycling children or/and duplicates
        if (computedChildren.includes(child)) {
          return [];
        } else {
          computedChildren.push(child);
        }

        const childDocument = await this.collection.get(child);

        if (!childDocument) {
          return [];
        }

        return await childDocument.getGlobalComplexTokensWithRef(computedChildren);
      }),
    );
    return [
      { owner: this.uri, tokens: this.complexTokens },
      ...(localStandardLibDefinitions
        ? [{ owner: localStandardLibDefinitions.uri, tokens: localStandardLibDefinitions.complexTokens }]
        : []),
    ].concat(tokens.flat());
  }

  public async getGlobalComplexTokens(
    computedChildren: string[] = [],
    localFunctionIdentifiers: string[] = [],
  ): Promise<ComplexToken[]> {
    const tokens = await Promise.all(
      this.children.flatMap(async (child) => {
        // Cycling children or/and duplicates
        if (computedChildren.includes(child)) {
          return [];
        } else {
          computedChildren.push(child);
        }

        const childDocument = await this.collection.get(child);

        if (!childDocument) {
          return [];
        }

        return await childDocument.getGlobalComplexTokens(computedChildren);
      }),
    );

    return this.complexTokens.filter((token) => !localFunctionIdentifiers.includes(token.identifier)).concat(tokens.flat());
  }

  public async getGlobalStructComplexTokensWithRef(computedChildren: string[] = []): Promise<OwnedStructComplexTokens[]> {
    const tokens = await Promise.all(
      this.children.flatMap(async (child) => {
        // Cycling children or/and duplicates
        if (computedChildren.includes(child)) {
          return [];
        } else {
          computedChildren.push(child);
        }

        const childDocument = await this.collection.get(child);

        if (!childDocument) {
          return [];
        }

        return await childDocument.getGlobalStructComplexTokensWithRef(computedChildren);
      }),
    );
    return [{ owner: this.uri, tokens: this.structComplexTokens }].concat(tokens.flat());
  }

  public async getGlobalStructComplexTokens(computedChildren: string[] = []): Promise<StructComplexToken[]> {
    const tokens = await Promise.all(
      this.children.flatMap(async (child) => {
        // Cycling children or/and duplicates
        if (computedChildren.includes(child)) {
          return [];
        } else {
          computedChildren.push(child);
        }

        const childDocument = await this.collection.get(child);

        if (!childDocument) {
          return [];
        }

        return await childDocument.getGlobalStructComplexTokens(computedChildren);
      }),
    );

    return this.structComplexTokens.concat(tokens.flat());
  }
}
