/* eslint-disable @typescript-eslint/quotes */
import * as cheerio from "cheerio";
import * as vscode from "vscode";
import { CookieAuthenticationProvider } from "../providers/authProvider";
import "isomorphic-fetch";
import path from "path";
import { SinfarFS } from "../providers/fileSystemProvider";
import { CompilerReturn, ERF, ResourceType } from "./types";

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

  public async writeFile(
    erfId: string,
    uri: vscode.Uri,
    content: Uint8Array,
    fileSystem: SinfarFS,
  ): Promise<{ status: Boolean; messages: CompilerReturn[] | undefined }> {
    const token = await this._getCookies();

    const resref = path.parse(uri.path).name;

    const bodyParams: URLSearchParams = new URLSearchParams({
      name: resref,
      erfId,
      code: content.toString(),
      gitLog: "",
    });
    const res = await fetch("https://nwn.sinfar.net/nss_compile.php", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        cookie: token,
      },
      body: bodyParams,
    });

    const response = await res.text();

    if (
      response === "<font color=#00FF00>The script has been successfully compiled.</font>" ||
      response === "<font color=#00FF00>Include script saved.</font>"
    ) {
      return { status: true, messages: undefined };
    } else {
      const set: CompilerReturn[] = [];
      const errorList = response.split("<br/>");
      if (errorList.length > 0) {
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

            const existing = set.find((s) => s.location.path === location.path);
            if (existing) {
              existing.diagnostics.push(diagnostic);
            } else {
              set.push({ location, diagnostics: [diagnostic] });
            }
          }
        }
        return { status: false, messages: set };
      }
    }
    return { status: true, messages: undefined };
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

  // Gets a JSON list of all the resources in all ERFs
  // return JSON representation of the ERF list or an error message
  public async getAllResources(): Promise<ERF[] | string> {
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
      return "Unauthorized. Please sign out then sign in again";
    }

    return erfList;
  }

  // Gets a JSON list of all the resources in the given ERF
  // return JSON representation of the ERF or an error message
  public async getERF(erfID: string): Promise<ERF | String> {
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
      return "Unauthorized. Please sign out then sign in again";
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

  public async getScript(resref: string): Promise<Uint8Array> {
    throw new Error("Method not implemented.");
  } // TODO

  public async saveScript(resref: string, content: Uint8Array): Promise<String[]> {
    throw new Error("Method not implemented.");
  } // TODO

  public async getResource(
    resref: string,
  ): Promise<{ erfId: String; resref: String; resType: ResourceType; content: Uint8Array }> {
    throw new Error("Method not implemented.");
  } // TODO

  public async saveResource(resref: string, content: Uint8Array): Promise<String> {
    throw new Error("Method not implemented.");
  } // TODO
}
