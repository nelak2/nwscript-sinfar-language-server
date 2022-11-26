/* eslint-disable @typescript-eslint/quotes */
import * as cheerio from "cheerio";
import * as vscode from "vscode";
import { CookieAuthenticationProvider } from "./authProvider";
import "isomorphic-fetch";

export type ERF = {
  id: number;
  prefix: string;
  title: string;
  description: string;
  ownerId: number;
  ownerName: string;
  lastUpdate: string;
  lockedBy?: string | null;
  loadAreasOnServers: number;
  accessOnServers: number;
  weight: number;
  options: number;
  public: number;
  inCore: number;
  permissions: number;
  resources?: Resources | null;
};
export type Resources = {
  utc?: string[] | null;
  uti?: string[] | null;
  utm?: string[] | null;
  utw?: string[] | null;
  utp?: string[] | null;
  ute?: string[] | null;
  dlg?: string[] | null;
  are?: string[] | null;
  git?: string[] | null;
  ["2da"]?: string[] | null;
  utd?: string[] | null;
  nss?: string[] | null;
  uts?: string[] | null;
  utt?: string[] | null;
  ifo?: string[] | null;
};

export class SinfarAPI {
  private async _getCookies(): Promise<string> {
    const session = await vscode.authentication.getSession(CookieAuthenticationProvider.id, []);
    if (!session) {
      throw new Error("Please login again");
    }
    return session.accessToken;
  }

  private _parseCookies(response: Response) {
    const cookie = response.headers.get("set-cookie");
    if (!cookie) {
      return "";
    }
    const parts = cookie.split(";").at(1)?.split(",");
    if (parts) {
      return parts[1].trimStart();
    }
    return "";
  }

  public async readFile(resref: string): Promise<Uint8Array> {
    const token = await this._getCookies();

    // Query the server for the script
    const url = "https://nwn.sinfar.net/res_nss_edit.php?name=" + resref;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "*/*",
        cookie: token,
      },
    });

    // We get the full html page back. We use cheerio to parse out the script block which contains
    // the scriptData variable
    const $ = cheerio.load(await res.text());

    // Use regex to extract the scriptData variable
    const regex = /(var scriptData = ")([\s\S]*)(";\s*var scriptResRef = ".*";)/;
    let script = $("script").text().match(regex)?.at(2);

    // Replace escaped characters
    // script = script?.replace("\\\\", "\\");
    script = script?.replaceAll("\\/", "/");
    script = script?.replaceAll("\\r\\n", "\r\n");
    // eslint-disable-next-line prettier/prettier
    script = script?.replaceAll('\\"', '"');
    script = script?.replaceAll("\\'", "'");

    const enc = new TextEncoder().encode(script);
    return enc;
  }

  public async writeFile(erfId: string, resref: string, content: Uint8Array): Promise<void> {
    const token = await this._getCookies();

    const headerParams: HeadersInit = new Headers({
      "content-type": "application/x-www-form-urlencoded",
      cookie: token,
    });
    const bodyParams: URLSearchParams = new URLSearchParams({
      name: resref,
      erfId,
      code: content.toString(),
      gitLog: "",
    });
    const res = await fetch("https://nwn.sinfar.net/nss_compile.php", {
      method: "POST",
      headers: headerParams,
      body: bodyParams,
    });

    const response = await res.text();

    if (
      response === "<font color=#00FF00>The script has been successfully compiled.</font>" ||
      response === "<font color=#00FF00>Include script saved.</font>"
    ) {
      void vscode.window.showInformationMessage("The script has been successfully saved and compiled.");
    } else {
      // Not registering as VS Code diagnostics to avoid conflicting with language server
      const errorList = response.split("<br/>");
      if (errorList.length > 0) {
        void vscode.window.showWarningMessage("The script saved but had compilation errors. See the log for more details");

        for (const errorListItem of errorList) {
          if (errorListItem === "<font color=#FF0000>Compilation aborted with errors</font>") {
            console.log("Compilation aborted with errors");
          }
          console.log(errorListItem);
        }
      }
    }
  }

  public async renameFile(oldErfId: string, oldResRef: string, newResRef: string): Promise<string> {
    const token = await this._getCookies();

    // Source name needs to include the file extension
    // Destination name should not include the extension
    const oldName = oldResRef + ".nss";
    const newName = newResRef;

    const params: URLSearchParams = new URLSearchParams({
      from: oldName,
      to: newName,
      "": oldErfId,
    });
    const res = await fetch("https://nwn.sinfar.net/res_rename.php", {
      method: "POST",
      headers: { cookie: token },
      body: params,
    });

    return await res.text();
  }

  public async deleteFile(erfId: string, resref: string): Promise<string> {
    const token = await this._getCookies();

    const params: URLSearchParams = new URLSearchParams({
      erf_id: erfId,
      res_name: resref + ".nss",
    });
    const res = await fetch("https://nwn.sinfar.net/res_delete.php?" + params.toString(), {
      method: "GET",
      headers: {
        cookie: token,
      },
    });

    return await res.text();
  }

  public async getAllResources(): Promise<ERF[]> {
    const token = await this._getCookies();

    const res = await fetch("https://nwn.sinfar.net/erf/api", {
      method: "GET",
      headers: {
        accept: "*/*",
        cookie: token,
      },
    });
    const erfList: ERF[] = <ERF[]>await res.json();

    // If the return is 401 (unauthorized) rather than an erfList as expected
    if (typeof erfList === "number") {
      throw new Error("Unauthorized. Please sign out then sign in again");
    }

    return erfList;
  }

  public async doLogin(userid: string, password: string): Promise<string> {
    const bodyParams: URLSearchParams = new URLSearchParams({
      format: "json",
      keep_logged: "1",
      password,
      player_name: userid,
    });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: bodyParams,
    };

    const response = await fetch("https://nwn.sinfar.net/login.php", requestOptions);

    return this._parseCookies(response);
  }
}
