import { join } from "path";
import { LanguageClient, ServerOptions, TransportKind } from "vscode-languageclient/node";

import type { LanguageClientOptions } from "vscode-languageclient/node";
import { ExtensionContext, authentication } from "vscode";

let client: LanguageClient;
const serverConfig = (serverPath: string) => {
  return { module: serverPath, transport: TransportKind.ipc };
};

export function activate(context: ExtensionContext) {
  const serverPath = context.asAbsolutePath(join("server", "out", "server.js"));
  const serverOptions: ServerOptions = {
    run: { ...serverConfig(serverPath) },
    debug: { ...serverConfig(serverPath), options: { execArgv: ["--nolazy", "--inspect=6009"] } },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "sinfar", language: "nwscript" }],
  };

  client = new LanguageClient("nwscript", "NWscript Language Server", serverOptions, clientOptions);
  client.registerProposedFeatures();
  client.start();

  void client.onReady().then(() => {
    registerCustomRequests();
  });
}

export function registerCustomRequests() {
  client.onRequest("sinfar/getSession", () => {
    return authentication.getSession("SinfarAuth", [], { createIfNone: true });
  });
  client.onRequest("sinfar/getFile", (uri: string) => {
    throw new Error("Method not implemented.");
  });
}

export async function deactivate() {
  return await client?.stop();
}
