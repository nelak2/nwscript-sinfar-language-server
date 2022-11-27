import type { Connection } from "vscode-languageserver";

export class SinfarAPI {
  private readonly connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public async getFile(uri: string): Promise<{ uri: string; content: string }> {
    return await this.connection.sendRequest("sinfar/getFile", uri);
  }
}
