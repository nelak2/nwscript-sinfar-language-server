/* eslint-disable @typescript-eslint/quotes */
import * as cheerio from "cheerio";
import * as vscode from "vscode";
import { CookieAuthenticationProvider } from "../providers/authProvider";
import fetch from "cross-fetch";
import path from "path";
import { Directory, Entry, File, SinfarFS } from "../providers/fileSystemProvider";
import { CompilerReturn, ERF, ResourceType } from "./types";

type logEntry = {
  time: Date;
  msgType: string;
  server: string;
  msg: string;
  script: string;
};

type parsedUri = {
  erfId: number;
  category: string;
  resref: string;
  fileExt: string;
  uri: vscode.Uri;
};

export class SinfarAPI {
  private _erfCache: ERF[] = [];
  // Tracks if the cache has been initialized since ERF's could be added prior to initialization
  // to handle open files on editor startup
  private initialized = false;
  private readonly _extPath: string;
  private readonly _cachePath: string;
  private readonly fileCache: Map<string, File> = new Map();

  constructor() {
    this._extPath = vscode.extensions.getExtension("NelaK.nwscript-sinfar-scripters-extension")?.extensionPath || "";
    this._cachePath = path.join(this._extPath, "client", "out", "cache");
  }

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

  public async lookup(parsedUri: parsedUri): Promise<Entry | undefined> {
    let erf = this._erfCache.find((erf) => erf.id === parsedUri.erfId);

    if (!erf) {
      // If the cache hasn't been initialized yet attempt a quick init
      // this happens when the user closes the editor with a file open
      // and on the next startup the editor tries to open the file again
      // before the cache has been initialized
      if (this._erfCache.length === 0) await this.getERF(parsedUri.erfId.toString());
      erf = this._erfCache.find((erf) => erf.id === parsedUri.erfId);

      if (!erf) return undefined;
    }

    if (parsedUri.erfId && !parsedUri.resref) {
      let dir: Directory;
      // If we are looking for a category, return a directory
      if (parsedUri.category) {
        dir = new Directory(parsedUri.category);
      } else {
        // If we are looking for an ERF, return an ERF
        dir = new Directory(parsedUri.erfId.toString());
      }
      dir.erf = erf;
      return dir;
    }

    // ERF has no resources
    if (!erf.resources) return undefined;

    // If we are looking for a file
    // Check the cache first
    let file: Entry | undefined;
    if (parsedUri.resref !== "") {
      file = this.fileCache.get(parsedUri.uri.path);

      if (file) return file;
    }

    // If we are looking for a metadata file
    if (parsedUri.category === "Metadata") {
      if (parsedUri.fileExt === "log") {
        this.fileCache.set(parsedUri.uri.path, new File(parsedUri.resref));
        return new File(parsedUri.resref);
      }
    }

    const resources = (erf.resources as any)[parsedUri.fileExt];
    if (!resources) return undefined;

    const resName = path.parse(parsedUri.resref).name;
    const resource = resources.find((resource: string) => resource === resName);
    if (!resource) return undefined;

    this.fileCache.set(parsedUri.uri.path, new File(parsedUri.resref));
    return new File(parsedUri.resref);
  }

  // Currently requesting once for text editor and again from LSP
  public async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    const resref = path.parse(uri.path).name;
    const ext = path.parse(uri.path).ext;

    // ignore vscode workspace files
    if (resref === "launch" || resref === "tasks" || resref === "settings") {
      return new Uint8Array();
    }

    let data = "";
    if (ext === ".log") {
      const id = path.parse(uri.path).dir.split("/").at(1) || "";

      if (resref === "erf_all") {
        data = await this.readLog(id, ext, false, true);
      } else {
        data = await this.readLog(id, ext, false, false);
      }
    } else if (ext !== ".nss") {
      data = await this.readResource(resref, ext);
    } else {
      data = await this.readScript(resref, ext);
    }

    return new TextEncoder().encode(data ?? "");
  }

  private async fetchLogMessages(id: string, page: number): Promise<{ logEntry: logEntry[]; pageCount: number }> {
    const token = await this._getCookies();
    // Query the server for the log
    const url = "https://nwn.sinfar.net/erf_logs.php?erf_id=" + id + "&page=" + page.toString();
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

    let pageCount = 0;
    try {
      const lastPager: any = $(".sinfar_pager")[0].children[$(".sinfar_pager")[0].children.length - 4];
      pageCount = lastPager?.children[0]?.data;
    } catch (e) {}

    const resource = $(".game_structure").html();

    const variableLines =
      resource?.match(
        /((?<=<td>)[\d :-]{19})(?:<\/td><td>)((?<=<td>)\d{4})(?:<\/td><td>)(INFO|WARNING|VERBOSE|DEBUG|ERROR|WTF)(?:<\/td><td>)[a-zA-Z0-9_]{1,16}(?:<\/td><td class="log_msg">)(.*)(?=<\/td>)/g,
      ) ?? "";

    const parsedValues: logEntry[] = [];

    if (variableLines.length > 0) {
      for (let i = 0; i < variableLines.length; i++) {
        const timeMatch = variableLines
          .at(i)
          ?.match(/^([\d :-]{19})/g)
          ?.at(0);

        const time = new Date(timeMatch ?? "");

        const server = variableLines
          .at(i)
          ?.match(/((?<=<\/td><td>)\d{4})/g)
          ?.at(0);

        const msgType = variableLines
          .at(i)
          ?.match(/(?<=<\/td><td>)(INFO|WARNING|VERBOSE|DEBUG|ERROR|WTF)/g)
          ?.at(0);
        const msg = variableLines
          .at(i)
          ?.match(/(?<=<\/td><td class="log_msg">)(.*)/g)
          ?.at(0);
        const script = variableLines
          .at(i)
          ?.match(/(?<=<\/td><td>)[a-zA-Z0-9_]{1,16}(?=<\/td><td class)/g)
          ?.at(0);

        parsedValues.push({ time, server: server || "", msgType: msgType || "", msg: msg || "", script: script || "" });
      }
    }

    return { logEntry: parsedValues, pageCount };
  }

  private async readLog(id: string, ext: string, JSONFormatted?: Boolean, ReadAll?: Boolean): Promise<string> {
    const result = await this.fetchLogMessages(id, 1);
    let logMessages = result.logEntry;

    if (ReadAll) {
      for (let i = 2; i <= result.pageCount; i++) {
        const extraResults = await this.fetchLogMessages(id, i);
        logMessages = logMessages.concat(extraResults.logEntry);
      }
    }

    if (!JSONFormatted) {
      // Return as tab separated values
      let output = "SERVER\t\t\t\t\t\tSERVER\tSCRIPT\t\t\tTYPE\tMESSAGE\n";
      for (let i = 0; i < logMessages.length; i++) {
        output += logMessages[i].time.toISOString() + "\t";
        output += logMessages[i].server + "\t";
        output += logMessages[i].script + "\t";
        output += logMessages[i].msgType + "\t";
        output += logMessages[i].msg + "\n";
      }
      return output;
    }

    // Return as JSON
    return JSON.stringify(logMessages, null, 2);
  }

  private async readResource(resref: string, ext: string): Promise<string> {
    const token = await this._getCookies();
    // Query the server for the script
    const url = "https://nwn.sinfar.net/res_edit.php?name=" + resref + ext;
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

    const resource = $("script").text();
    const variableLines = resource.match(/var .*/g) ?? "";

    const parsedValues: string[] = ["{"];

    for (let i = 0; i < variableLines?.length; i++) {
      const line = variableLines?.at(i)?.match(/(var )(.*) = (.*)(;)/);
      const varName = line?.at(2);
      const value = line?.at(3);

      if (varName && value) {
        if (i < variableLines?.length - 1) {
          parsedValues.push('"' + varName + '":' + value + ",");
        } else {
          parsedValues.push('"' + varName + '":' + value);
        }
      }
    }

    parsedValues.push("}");
    const content = parsedValues.join("");

    return content;
  }

  private async readScript(resref: string, ext: string): Promise<string> {
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
    return script.scriptData;
  }

  public async writeFileVirtual(path: string, content: File): Promise<void> {
    this.fileCache.set(path, content);
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
            let location = fileSystem.findFile(scriptName, fileSystem.root);
            if (!location) {
              location = vscode.Uri.from({ scheme: "sinfar", path: scriptName });
            }
            lineNumber = lineNumber.replace("(", "").replace(")", "");

            const range = new vscode.Range(Number(lineNumber) - 1, 0, Number(lineNumber) - 1, 100);

            const diagnostic: vscode.Diagnostic = {
              severity: vscode.DiagnosticSeverity.Error,
              range,
              message,
              source: "Sinfar",
            };

            const existing = set.find((s) => s.location.path === location?.path);
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

  /**
   * Fetches a JSON list of all the resources in all ERFs from the server
   * We will return from the memory cache if we have it, otherwise we will try to load from the file system cache
   * If we don't have a cache on the file system, we will fetch from the server and cache the result
   * If a callback function is provided, we will return from the cache but also call the callback function when
   * the cache is updated
   * @param callback Optional callback function to be called when the resource list is updated
   * @returns JSON representation of the ERF list or an error message
   */
  public async getAllResources(callback?: Function): Promise<ERF[] | string> {
    // Check if we have a cached version of the resource list in memory
    if (this._erfCache.length > 0 && this.initialized) {
      return this._erfCache;
    }

    // Check if we have a cached version of the resource list on the file system
    const allResourceCachePath = path.join(this._cachePath, "allResources.json");
    let fsCache: Uint8Array;
    try {
      fsCache = await vscode.workspace.fs.readFile(vscode.Uri.file(allResourceCachePath));
    } catch (e) {
      fsCache = new Uint8Array();
    }
    if (fsCache.byteLength > 0) {
      // load the cache from the file system
      this._erfCache = JSON.parse(fsCache.toString());

      // We return the cache here but still fetch from the server in the background
      // So that the cache is updated if the server has changed
      if (callback) {
        void this.getAllResourcesFromServer();
      }

      this.initialized = true;
      return this._erfCache;
    }

    this.initialized = true;
    // If memory and file system cache are empty, fetch and return from the server
    return await this.getAllResourcesFromServer();
  }

  private async getAllResourcesFromServer(callback?: Function): Promise<ERF[] | string> {
    // If memory and file system cache are empty, fetch from the server
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

    // Cache the list in memory
    this._erfCache = erfList;
    // Cache the list on the file system
    const allResourceCachePath = path.join(this._cachePath, "allResources.json");
    await vscode.workspace.fs.writeFile(vscode.Uri.file(allResourceCachePath), Buffer.from(JSON.stringify(erfList)));

    if (callback) {
      callback();
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

    // Update the cache
    let existingERF = this._erfCache.find((e) => e.id === parseInt(erfID));
    if (existingERF) {
      existingERF = erf;
    } else {
      this._erfCache.push(erf);
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

  public async createERFFolder(erf: ERF, fs: SinfarFS) {
    // Change from the original to use the ERF ID instead of the title
    /*
    const folder =
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      "sinfar:/" + erf.prefix + " - " + erf.title.replace(/[/\\*."\\[\]:;|,<>?]/g, "") + " (" + erf.id + ")";
      */
    const folder = "sinfar:/" + erf.id.toString();

    const folderUri = vscode.Uri.parse(folder);

    fs.createDirectoryInit(folderUri);
    const dir = await fs.stat(folderUri);
    if (dir instanceof Directory) {
      dir.erf = erf;
    }

    await this.createERFSubFolders(erf, dir as Directory, folderUri, fs);
  }

  public async createERFSubFolders(erf: ERF, erfDir: Directory, erfPath: vscode.Uri, fs: SinfarFS) {
    const root = erfPath.toString();

    fs.createDirectoryInit(vscode.Uri.parse(root + "/Scripts"));
    // if (erf.resources?.nss) {
    //   for (const nss of erf.resources.nss) {
    //     await fs.writeFile(vscode.Uri.parse(root + "/Scripts/" + nss + ".nss"), new Uint8Array(0), {
    //       create: true,
    //       overwrite: false,
    //       initializing: true,
    //     });
    //   }
    // }

    fs.createDirectoryInit(vscode.Uri.parse(root + "/Areas"));
    // if (erf.resources?.are) {
    //   for (const are of erf.resources.are) {
    //     await fs.writeFile(vscode.Uri.parse(root + "/Areas/" + are + ".are"), new Uint8Array(0), {
    //       create: true,
    //       overwrite: false,
    //       initializing: true,
    //     });
    //     await fs.writeFile(vscode.Uri.parse(root + "/Areas/" + are + ".git"), new Uint8Array(0), {
    //       create: true,
    //       overwrite: false,
    //       initializing: true,
    //     });
    //   }
    // }

    fs.createDirectoryInit(vscode.Uri.parse(root + "/Conversation"));
    // if (erf.resources?.dlg) {
    //   for (const dlg of erf.resources.dlg) {
    //     await fs.writeFile(vscode.Uri.parse(root + "/Conversation/" + dlg + ".dlg"), new Uint8Array(0), {
    //       create: true,
    //       overwrite: false,
    //       initializing: true,
    //     });
    //   }
    // }

    fs.createDirectoryInit(vscode.Uri.parse(root + "/Items"));
    // if (erf.resources?.uti) {
    //   for (const uti of erf.resources.uti) {
    //     await fs.writeFile(vscode.Uri.parse(root + "/Items/" + uti + ".uti"), new Uint8Array(0), {
    //       create: true,
    //       overwrite: false,
    //       initializing: true,
    //     });
    //   }
    // }

    fs.createDirectoryInit(vscode.Uri.parse(root + "/Creatures"));
    // if (erf.resources?.utc) {
    //   for (const utc of erf.resources.utc) {
    //     await fs.writeFile(vscode.Uri.parse(root + "/Creatures/" + utc + ".utc"), new Uint8Array(0), {
    //       create: true,
    //       overwrite: false,
    //       initializing: true,
    //     });
    //   }
    // }

    fs.createDirectoryInit(vscode.Uri.parse(root + "/Placeables"));
    // if (erf.resources?.utp) {
    //   for (const utp of erf.resources.utp) {
    //     await fs.writeFile(vscode.Uri.parse(root + "/Placeables/" + utp + ".utp"), new Uint8Array(0), {
    //       create: true,
    //       overwrite: false,
    //       initializing: true,
    //     });
    //   }
    // }

    fs.createDirectoryInit(vscode.Uri.parse(root + "/Encounters"));
    // if (erf.resources?.ute) {
    //   for (const ute of erf.resources.ute) {
    //     await fs.writeFile(vscode.Uri.parse(root + "/Encounters/" + ute + ".ute"), new Uint8Array(0), {
    //       create: true,
    //       overwrite: false,
    //       initializing: true,
    //     });
    //   }
    // }

    fs.createDirectoryInit(vscode.Uri.parse(root + "/Triggers"));
    // if (erf.resources?.utt) {
    //   for (const utt of erf.resources.utt) {
    //     await fs.writeFile(vscode.Uri.parse(root + "/Triggers/" + utt + ".utt"), new Uint8Array(0), {
    //       create: true,
    //       overwrite: false,
    //       initializing: true,
    //     });
    //   }
    // }

    fs.createDirectoryInit(vscode.Uri.parse(root + "/Merchants"));
    // if (erf.resources?.utm) {
    //   for (const utm of erf.resources.utm) {
    //     await fs.writeFile(vscode.Uri.parse(root + "/Merchants/" + utm + ".utm"), new Uint8Array(0), {
    //       create: true,
    //       overwrite: false,
    //       initializing: true,
    //     });
    //   }
    // }

    fs.createDirectoryInit(vscode.Uri.parse(root + "/Doors"));
    // if (erf.resources?.utd) {
    //   for (const utd of erf.resources.utd) {
    //     await fs.writeFile(vscode.Uri.parse(root + "/Doors/" + utd + ".utd"), new Uint8Array(0), {
    //       create: true,
    //       overwrite: false,
    //       initializing: true,
    //     });
    //   }
    // }

    fs.createDirectoryInit(vscode.Uri.parse(root + "/Waypoints"));
    // if (erf.resources?.utw) {
    //   for (const utw of erf.resources.utw) {
    //     await fs.writeFile(vscode.Uri.parse(root + "/Waypoints/" + utw + ".utw"), new Uint8Array(0), {
    //       create: true,
    //       overwrite: false,
    //       initializing: true,
    //     });
    //   }
    // }

    fs.createDirectoryInit(vscode.Uri.parse(root + "/Sounds"));
    // if (erf.resources?.uts) {
    //   for (const uts of erf.resources.uts) {
    //     await fs.writeFile(vscode.Uri.parse(root + "/Sounds/" + uts + ".uts"), new Uint8Array(0), {
    //       create: true,
    //       overwrite: false,
    //       initializing: true,
    //     });
    //   }
    // }

    fs.createDirectoryInit(vscode.Uri.parse(root + "/2DA"));
    // if (erf.resources?.["2da"]) {
    //   for (const _2da of erf.resources["2da"]) {
    //     await fs.writeFile(vscode.Uri.parse(root + "/2DA/" + _2da + ".2da"), new Uint8Array(0), {
    //       create: true,
    //       overwrite: false,
    //       initializing: true,
    //     });
    //   }
    // }

    fs.createDirectoryInit(vscode.Uri.parse(root + "/Module Info"));
    // if (erf.resources?.ifo) {
    //   for (const ifo of erf.resources.ifo) {
    //     await fs.writeFile(vscode.Uri.parse(root + "/Module Info/" + ifo + ".ifo"), new Uint8Array(0), {
    //       create: true,
    //       overwrite: false,
    //       initializing: true,
    //     });
    //   }
    // }

    // Create folder for virtual metadata files on the ERF (eg. logs, etc.)
    fs.createDirectoryInit(vscode.Uri.parse(root + "/Metadata"));
    // await fs.writeFile(vscode.Uri.parse(root + "/Metadata/erf_all.log"), new Uint8Array(0), {
    //   create: true,
    //   overwrite: false,
    //   initializing: true,
    // });
    // await fs.writeFile(vscode.Uri.parse(root + "/Metadata/erf_recent.log"), new Uint8Array(0), {
    //   create: true,
    //   overwrite: false,
    //   initializing: true,
    // });
  }
}
