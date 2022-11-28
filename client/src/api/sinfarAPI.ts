/* eslint-disable @typescript-eslint/quotes */
import * as cheerio from "cheerio";
import * as vscode from "vscode";
import { CookieAuthenticationProvider } from "../providers/authProvider";
import "isomorphic-fetch";
import path from "path";
import { SinfarFS } from "../providers/fileSystemProvider";
import { ERF } from "./types";

export class SinfarAPI {
  private readonly diagCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection("Sinfar");

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

    // ignore vscode workspace files
    if (resref === "launch" || resref === "tasks" || resref === "settings") {
      return new Uint8Array();
    }

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

    // Extract the scriptData variable from the script block
    const script = JSON.parse(
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      '{"scriptData":"' +
        $("script")
          ?.text()
          ?.match(/var scriptData = ".*/)
          ?.at(0)
          ?.match(/(")(.*)(";)/)
          ?.at(2) +
        '"}',
    );
    return new TextEncoder().encode(script.scriptData);
  }

  public async writeFile(erfId: string, uri: vscode.Uri, content: Uint8Array, fileSystem: SinfarFS): Promise<void> {
    const token = await this._getCookies();

    const resref = path.parse(uri.path).name;

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

    // Clear the diagnostics collection for this file
    this.diagCollection.delete(uri);
    if (
      response === "<font color=#00FF00>The script has been successfully compiled.</font>" ||
      response === "<font color=#00FF00>Include script saved.</font>"
    ) {
      void vscode.window.showInformationMessage("The script has been successfully saved and compiled.");
    } else {
      const errorList = response.split("<br/>");
      if (errorList.length > 0) {
        void vscode.window.showWarningMessage("The script saved but had compilation errors. See the log for more details");
        // const diagnostics: vscode.Diagnostic[] = [];
        const set: { loc: vscode.Uri; diag: vscode.Diagnostic[] }[] = [];

        for (const errorListItem of errorList) {
          const parse = errorListItem.match(/(^.*.nss)(\(\d*\))(:)(.*)/);
          const scriptName = parse?.at(1);
          let lineNumber = parse?.at(2);
          const message = parse?.at(4);

          if (scriptName && lineNumber && message) {
            const location = fileSystem.findFile(scriptName);
            lineNumber = lineNumber.replace("(", "").replace(")", "");

            const range = new vscode.Range(Number(lineNumber) - 1, 0, Number(lineNumber) - 1, 100);

            const diagnostic: vscode.Diagnostic = {
              severity: vscode.DiagnosticSeverity.Error,
              range,
              message,
              source: "Sinfar",
            };

            const existing = set.find((s) => s.loc.path === location.path);
            if (existing) {
              existing.diag.push(diagnostic);
            } else {
              set.push({ loc: location, diag: [diagnostic] });
            }
          }
        }
        for (const s of set) {
          this.diagCollection.set(s.loc, s.diag);
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

  public async getERF(erfID: string): Promise<ERF> {
    const token = await this._getCookies();

    const res = await fetch("https://nwn.sinfar.net/erf/api/" + erfID, {
      method: "GET",
      headers: {
        accept: "*/*",
        cookie: token,
      },
    });
    const test = await res.text();
    // const erf: ERF = <ERF>await res.json();
    const erf = JSON.parse(test) as ERF;

    // If the return is 401 (unauthorized) rather than an erf as expected
    if (typeof erf === "number") {
      throw new Error("Unauthorized. Please sign out then sign in again");
    }

    return erf;
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

  public async getScript(resref: string): Promise<Uint8Array> {} // TODO

  public async saveScript(resref: string, content: Uint8Array): Promise<void> {} // TODO

  public async getArea(resref: string): Promise<Uint8Array> {} // TODO

  public async saveArea(resref: string, content: Uint8Array): Promise<void> {} // TODO

  public async getDialog(resref: string): Promise<Uint8Array> {} // TODO

  public async saveDialog(resref: string, content: Uint8Array): Promise<void> {} // TODO

  public async getItem(resref: string): Promise<Uint8Array> {} // TODO

  public async saveItem(resref: string, content: Uint8Array): Promise<void> {} // TODO

  public async getCreature(resref: string): Promise<Uint8Array> {} // TODO

  public async saveCreature(resref: string, content: Uint8Array): Promise<void> {} // TODO

  public async getPlaceable(resref: string): Promise<Uint8Array> {} // TODO

  public async savePlaceable(resref: string, content: Uint8Array): Promise<void> {} // TODO

  public async getEncounter(resref: string): Promise<Uint8Array> {} // TODO

  public async saveEncounter(resref: string, content: Uint8Array): Promise<void> {} // TODO

  public async getTrigger(resref: string): Promise<Uint8Array> {} // TODO

  public async saveTrigger(resref: string, content: Uint8Array): Promise<void> {} // TODO

  public async getMerchant(resref: string): Promise<Uint8Array> {} // TODO

  public async saveMerchant(resref: string, content: Uint8Array): Promise<void> {} // TODO

  public async getDoor(resref: string): Promise<Uint8Array> {} // TODO

  public async saveDoor(resref: string, content: Uint8Array): Promise<void> {} // TODO

  public async getWaypoint(resref: string): Promise<Uint8Array> {} // TODO

  public async saveWaypoint(resref: string, content: Uint8Array): Promise<void> {} // TODO

  public async getSound(resref: string): Promise<Uint8Array> {} // TODO

  public async saveSound(resref: string, content: Uint8Array): Promise<void> {} // TODO

  public async get2DA(resref: string): Promise<Uint8Array> {} // TODO

  public async save2DA(resref: string, content: Uint8Array): Promise<void> {} // TODO
}
