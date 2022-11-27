import { ParameterInformation, SignatureInformation } from "vscode-languageserver";

import type { FunctionComplexToken } from "../../Tokenizer/types";
import Builder from "./Builder";

export default class SignatureHelpBuilder extends Builder {
  static buildFunctionItem(token: FunctionComplexToken, activeParameter: number | undefined) {
    return {
      signatures: [
        SignatureInformation.create(
          `${this.handleLanguageType(token.returnType)} ${token.identifier}(${token.params.reduce((acc, param, index) => {
            return `${acc}${this.handleLanguageType(param.valueType)} ${param.identifier}${
              index === token.params.length - 1 ? "" : ", "
            }`;
          }, "")})`,
          undefined,
          ...token.params.map<ParameterInformation>((param) =>
            ParameterInformation.create(
              `${param.valueType} ${param.identifier}`,
              this.getCommentFromToken(token, param.identifier),
            ),
          ),
        ),
      ],
      activeSignature: 0,
      activeParameter: activeParameter || null,
    };
  }

  static getCommentFromToken(token: FunctionComplexToken, identifier: string): string | undefined {
    for (const comment of token.comments) {
      if (comment.includes("@param " + identifier)) {
        return comment;
      }
    }
    return undefined;
  }
}
