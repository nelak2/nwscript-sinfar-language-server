import path, { join } from "path";
import { LanguageClient, ServerOptions, TransportKind } from "vscode-languageclient/node";
import * as vscode from "vscode";

import type { LanguageClientOptions } from "vscode-languageclient/node";
import { ExtensionContext } from "vscode";

import { SinfarFS } from "./providers/fileSystemProvider";
import { CookieAuthenticationProvider } from "./providers/authProvider";
import { SinfarAPI } from "./api/sinfarAPI";
import { AreaGitEditorProvider } from "./providers/areaGitEditorProvider";
import { ERF } from "./api/types";

let client: LanguageClient;
let fs: SinfarFS;
let remoteAPI: SinfarAPI;
const serverConfig = (serverPath: string) => {
  return { module: serverPath, transport: TransportKind.ipc };
};

export function activate(context: ExtensionContext) {
  InitSinfar(context);
  InitLSP(context);
  InitEditors(context);
}

export function InitEditors(context: ExtensionContext) {
  context.subscriptions.push(AreaGitEditorProvider.register(context));
}

export function InitLSP(context: ExtensionContext) {
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
  client.onRequest("sinfar/getFile", async (resref: string) => {
    const filePath = fs.findFile(resref);

    const file = await fs.readFile(filePath);
    const decoder = new TextDecoder();
    return { uri: filePath.toString(), content: decoder.decode(file) };
  });
}

export async function deactivate() {
  return await client?.stop();
}

export function InitSinfar(context: ExtensionContext) {
  fs = new SinfarFS();
  remoteAPI = new SinfarAPI();
  context.subscriptions.push(
    vscode.workspace.registerFileSystemProvider("sinfar", fs, {
      isCaseSensitive: false,
    }),
  );
  let initialized = false;

  context.subscriptions.push(
    vscode.authentication.registerAuthenticationProvider(
      CookieAuthenticationProvider.id,
      "Sinfar Dev",
      new CookieAuthenticationProvider(context.secrets),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sinfar.gotoERF", async (event) => {
      const erfID: string = event.path
        .match(/(\()([0-9]{1,4})(\))$/)
        .at(2)
        .toString();

      void vscode.env.openExternal(vscode.Uri.parse("https://nwn.sinfar.net/res_list.php?erf_id=" + erfID));
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sinfar.gotoNSS", async (event) => {
      const resref: string = path.parse(event.path).name;

      void vscode.env.openExternal(vscode.Uri.parse("https://nwn.sinfar.net/res_nss_edit.php?name=" + resref));
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sinfar.logout", async () => {
      await context.secrets.delete(CookieAuthenticationProvider.id);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sinfar.setup", async () => {
      if (initialized) {
        return;
      }
      initialized = true;

      // This causes the extensions to be terminated and restarted
      vscode.workspace.updateWorkspaceFolders(0, 0, {
        uri: vscode.Uri.parse("sinfar:/"),
        name: "Sinfar",
      });
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sinfar.reloadERF", async (event) => {
      void vscode.window.withProgress(
        { location: vscode.ProgressLocation.SourceControl, title: "Fetching data from server..." },
        async (progress) => {
          const erfID: string = event.path
            .match(/(\()([0-9]{1,4})(\))$/)
            .at(2)
            .toString();

          const erf = await remoteAPI.getERF(erfID);

          if (typeof erf === "string") {
            void vscode.window.showErrorMessage(erf);
          } else {
            await fs.deleteVirtualFiles(event);

            for (const res of (<ERF>erf).resources?.nss ?? []) {
              // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
              await fs.writeFile(vscode.Uri.parse(event + "/" + res + ".nss"), new Uint8Array(0), {
                create: true,
                overwrite: true,
                initializing: true,
              });
            }
          }
        },
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sinfar.login", async () => {
      const workspace = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse("sinfar:/"));

      if (!workspace) {
        throw new Error("Setup the Sinfar Workspace first");
      }

      initialized = true;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const session = await vscode.authentication.getSession(CookieAuthenticationProvider.id, [], { createIfNone: true });
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: "Fetching data from server...", cancellable: true },
        async (progress) => {
          try {
            const erfList = await remoteAPI.getAllResources();

            if (typeof erfList === "string") {
              throw new Error(erfList);
            }

            for (const _erf of erfList) {
              await remoteAPI.createERFFolder(_erf, fs, false);
            }

            void vscode.window.showInformationMessage("ERF's loaded! Workspace ready for use");
          } catch (e: any) {
            // Clear session and throw error
            await context.secrets.delete(CookieAuthenticationProvider.id);
            throw new Error(e.toString());
          }
        },
      );
    }),
  );
}
