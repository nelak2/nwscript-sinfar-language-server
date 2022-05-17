import { CompletionItemKind } from "vscode-languageserver";
import type { ServerManager } from "../ServerManager";
import type { ComplexToken } from "../Tokenizer/types";
import { TokenizedScope } from "../Tokenizer/Tokenizer";
import { WorkspaceFilesSystem } from "../WorkspaceFilesSystem";
import Provider from "./Provider";
import { HoverContentBuilder } from "./Builders";
import { DocumentsCollection } from "../Documents";

export default class HoverContentProvider extends Provider {
  constructor(server: ServerManager) {
    super(server);

    this.server.connection.onHover((params) => {
      const {
        textDocument: { uri },
        position,
      } = params;

      const liveDocument = this.server.liveDocumentsManager.get(uri);
      const path = WorkspaceFilesSystem.fileUriToPath(uri);
      const documentKey = WorkspaceFilesSystem.getFileBasename(path);
      const document = this.server.documentsCollection?.get(documentKey);

      if (liveDocument) {
        let token: ComplexToken | undefined;
        const { tokenType, structVariableIdentifier, identifier } = this.server.tokenizer?.findActionTarget(
          liveDocument.getText(),
          position
        )!;

        const localScope = this.server.tokenizer?.tokenizeContent(liveDocument.getText(), TokenizedScope.local, 0, position.line);

        if (!tokenType) {
          token = localScope?.functionVariablesComplexTokens.find((token) => token.identifier === identifier);
        }

        if (!token && tokenType === CompletionItemKind.Function) {
          token = localScope?.functionsComplexTokens.find((token) => token.identifier === identifier);
        }
        if (document) {
          if (tokenType === CompletionItemKind.Property && structVariableIdentifier) {
            const structIdentifer = localScope?.functionVariablesComplexTokens.find(
              (token) => token.identifier === structVariableIdentifier
            )?.valueType;

            token = document
              .getGlobalStructComplexTokens()
              .find((token) => token.identifier === structIdentifer)
              ?.properties.find((property) => property.identifier === identifier);
          }

          if (!token && tokenType === CompletionItemKind.Struct) {
            const tokens = document.getGlobalStructComplexTokens();
            token = tokens.find((token) => token.identifier === identifier);
          }

          if (!token && (tokenType === CompletionItemKind.Constant || tokenType === CompletionItemKind.Function)) {
            const tokens = document.getGlobalComplexTokens();
            token = tokens.find((token) => token.identifier === identifier);
          }

          if (
            !token &&
            (tokenType === CompletionItemKind.Constant || tokenType === CompletionItemKind.Function) &&
            this.server.documentsCollection
          ) {
            const tokens = this.server.documentsCollection.standardLibComplexTokens;
            token = tokens.find((token) => token.identifier === identifier);
          }
        }

        if (token) {
          return {
            contents: HoverContentBuilder.buildItem(token),
          };
        }
      }

      return undefined;
    });
  }
}