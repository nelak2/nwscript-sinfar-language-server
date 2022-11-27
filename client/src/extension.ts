import path, { join } from "path";
import { LanguageClient, ServerOptions, TransportKind } from "vscode-languageclient/node";
import * as vscode from "vscode";

import type { LanguageClientOptions } from "vscode-languageclient/node";
import { ExtensionContext } from "vscode";

import { Directory, SinfarFS } from "./fileSystemProvider";
import { CookieAuthenticationProvider } from "./authProvider";
import { SinfarAPI } from "./sinfarAPI";

let client: LanguageClient;
let fs: SinfarFS;
let remoteAPI: SinfarAPI;
const serverConfig = (serverPath: string) => {
  return { module: serverPath, transport: TransportKind.ipc };
};

export function activate(context: ExtensionContext) {
  InitSinfar(context);
  InitLSP(context);
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
      const erfID: string = event.path
        .match(/(\()([0-9]{1,4})(\))$/)
        .at(2)
        .toString();

      const ERF = await remoteAPI.getERF(erfID);

      await fs.deleteVirtualFiles(event);

      for (const res of ERF.resources?.nss ?? []) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        await fs.writeFile(vscode.Uri.parse(event + "/" + res + ".nss"), new Uint8Array(0), {
          create: true,
          overwrite: true,
          initializing: true,
        });
      }
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

      try {
        void vscode.window.showInformationMessage("Downloading ERF data...");

        const erfList = await remoteAPI.getAllResources();

        for (const _erf of erfList) {
          const folder =
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            "sinfar:/" + _erf.prefix + " - " + _erf.title.replace(/[/\\*."\\[\]:;|,<>?]/g, "") + " (" + _erf.id + ")";
          const folderUri = vscode.Uri.parse(folder);

          fs.createDirectoryInit(folderUri);
          const dir = fs.stat(folderUri);
          if (dir instanceof Directory) {
            dir.erf = _erf;
          }

          if (_erf.resources?.nss) {
            for (const _nss of _erf.resources.nss) {
              await fs.writeFile(vscode.Uri.parse(folder + "/" + _nss + ".nss"), new Uint8Array(0), {
                create: true,
                overwrite: false,
                initializing: true,
              });
            }
          }
        }

        void vscode.window.showInformationMessage("ERF's loaded! Workspace ready for use");
      } catch (e: any) {
        // Clear session and throw error
        await context.secrets.delete(CookieAuthenticationProvider.id);
        throw new Error(e.toString());
      }
    }),
  );
}
