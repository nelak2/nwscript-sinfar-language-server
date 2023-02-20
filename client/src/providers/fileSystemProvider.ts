import * as path from "path";
import * as vscode from "vscode";
import { SinfarAPI } from "../api/sinfarAPI";
import { ERF } from "../api/types";

export class File implements vscode.FileStat {
  type: vscode.FileType;
  ctime: number;
  mtime: number;
  size: number;

  name: string;
  data?: Uint8Array;

  constructor(name: string) {
    this.type = vscode.FileType.File;
    this.ctime = Date.now();
    this.mtime = Date.now();
    this.size = 0;
    this.name = name;
  }
}

export class Directory implements vscode.FileStat {
  type: vscode.FileType;
  ctime: number;
  mtime: number;
  size: number;
  erf: ERF | undefined;

  name: string;
  entries: Map<string, File | Directory>;

  constructor(name: string) {
    this.type = vscode.FileType.Directory;
    this.ctime = Date.now();
    this.mtime = Date.now();
    this.size = 0;
    this.name = name;
    this.entries = new Map();
  }
}

export type Entry = File | Directory;

export class SinfarFS implements vscode.FileSystemProvider {
  root = new Directory("");
  remoteAPI;
  private readonly diagCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection("Sinfar");

  constructor(api: SinfarAPI) {
    this.remoteAPI = api;
  }

  // --- manage file metadata

  async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
    return await this._lookup(uri, false);
  }

  readDirectory(uri: vscode.Uri): [string, vscode.FileType][] {
    const entry = this._lookupAsDirectory(uri, false);
    const result: [string, vscode.FileType][] = [];

    for (const [name, child] of entry.entries) {
      result.push([name, child.type]);
    }
    return result;
  }

  // find a file based on a file name
  findFile(name: string, parent: Directory): vscode.Uri | undefined {
    for (const erf of parent.entries) {
      if (erf[1] instanceof Directory) {
        const result = this.findFile(name, erf[1]);
        if (result) {
          return vscode.Uri.from({ scheme: "sinfar", path: "/" + erf[0] + "/" + result.path });
        }
      }
      if (erf[1] instanceof File) {
        if (erf[0] === name) {
          return vscode.Uri.from({ scheme: "sinfar", path: erf[0] });
        }
      }
    }
  }

  // --- manage file contents

  async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    const enc = await this.remoteAPI.readFile(uri);

    // Store the downloaded script. If the file doesn't exist
    // this will fail
    try {
      const basename = path.posix.basename(uri.path);

      const parent = this._lookupParentDirectory(uri);
      const entry = parent.entries.get(basename);
      if (entry && entry instanceof File) {
        entry.size = enc.byteLength;
        entry.data = enc;
      }
    } catch {}

    return enc;
  }

  /**
   * Writes file to the virtual file system
   * @param uri - URI of the file being written
   * @param content - File contents
   * @param options - create: Create new file if it does not exist
   * 				  - overwrite: Overwrite an existing file
   * 				  - localOnly: Only write the file to the virtual file server. DO NOT upload to the server
   */
  async writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    options: { create: boolean; overwrite: boolean; initializing: boolean },
  ): Promise<void> {
    const parsedUri = this.parseUri(uri);

    if (!parsedUri) throw new Error("Invalid URI");

    if (parsedUri?.fileExt === "log") {
      void vscode.window.showInformationMessage("Cannot write to Log files. Use 'Save As' if you'd like to save a copy");
      return;
    }

    // Check if the file exists
    const file = await this.remoteAPI.lookup(parsedUri);
    const parentERF = await this.remoteAPI.lookup({ erfId: parsedUri.erfId, category: "", resref: "", fileExt: "", uri });

    if (!parentERF || parentERF instanceof File) {
      throw new Error("Invalid ERF");
    }

    if (parsedUri.resref === "") {
      throw vscode.FileSystemError.FileIsADirectory(uri);
    }
    if (!file && !options.create) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }
    if (file && options.create && !options.overwrite) {
      throw vscode.FileSystemError.FileExists(uri);
    }

    // Create new file
    if (!file) {
      const basename = path.posix.basename(uri.path);
      const prefix = basename.split("_")[0];

      if (!options.initializing && prefix !== parentERF.erf?.prefix) {
        throw new Error("All resource prefixes must match the parent ERF prefix");
      }

      // Check for resref name length. It is limited to 16 characters + 4 characters for the file extension
      if (basename.length > 20) {
        // Special handling for a few resources on Sinfar that are longer than the resref limit
        if (!options.initializing) {
          throw new Error("Resrefs can be a maximum of 16 characters. Try again");
        }
      }

      const newFile = new File(basename);
      await this.remoteAPI.writeFileVirtual(parsedUri.uri.path, newFile);

      this._fireSoon({ type: vscode.FileChangeType.Created, uri });
    }

    if (file instanceof Directory) throw new Error("Cannot write to a directory");
    if (!file) throw new Error("File not found");

    // Update virtual file
    file.mtime = Date.now();
    file.size = content.byteLength;
    file.data = content;

    // The virtual file system is initialized with empty files to avoid excessive server requests.
    // The actual file contents are downloaded when the file is read. We want to ensure that we
    // don't accidentally upload these empty files to the server. If the localOnly flag is not set
    // then writeFile() is not being called from our initialization functions and therefore we can
    // safely upload the files to the server.
    if (!options.initializing) {
      // Verify our folder is correctly associated with an ERF
      if (!parentERF.erf) {
        throw new Error("Invalid ERF");
      }

      // Clear diagnostics
      this.diagCollection.delete(uri);
      const results = await this.remoteAPI.writeFile(parentERF.erf.id.toString(), uri, content, this);
      if (results.status) {
        void vscode.window.showInformationMessage("The script has been successfully saved and compiled.");
      } else {
        void vscode.window.showWarningMessage("The script saved but had compilation errors. See the log for more details");

        // Display diagnostics
        for (const s of results.messages || []) {
          this.diagCollection.set(s.location, s.diagnostics);
        }
      }
    }
    this._fireSoon({ type: vscode.FileChangeType.Changed, uri });
  }

  // --- manage files/folders

  /**
   * Rename resources on the server. Can be used to move things between ERF's by changing their prefixes
   * This function will move them incorrectly if they are part of an ERF that is setup to allow any prefix
   * @param oldUri Old resref
   * @param newUri New resref
   * @param options
   */
  async rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean }): Promise<void> {
    if (!options.overwrite && (await this._lookup(newUri, true))) {
      throw vscode.FileSystemError.FileExists(newUri);
    }

    const entry = await this._lookup(oldUri, false);
    const oldParent = this._lookupParentDirectory(oldUri);

    // Prevent users from renaming directories/ERFs
    if (entry instanceof Directory) {
      throw new Error("Cannot rename ERFs");
    }

    let newParent = oldParent;
    const newName = path.posix.basename(newUri.path);
    const newPrefix = path.posix.basename(newUri.path).split("_")[0];

    // Verify the new name doesn't exceed the max length of 16 characters + 4 for the file extension
    if (newName.length > 20) {
      throw new Error("Resrefs can be a maximum of 16 characters. Try again");
    }

    // If we are changing our prefix we need to correctly set our new ERF
    for (const entry of this.root.entries) {
      if (entry[1] instanceof Directory && entry[1].erf) {
        if (entry[1].erf.prefix === newPrefix) {
          newParent = entry[1];
          break;
        }
      }
    }

    if (!oldParent.erf) {
      throw new Error("Invalid source ERF");
    }
    if (!newParent.erf) {
      throw new Error("Invalid destination ERF");
    }

    const result = await this.remoteAPI.renameFile(
      oldParent.erf.id.toString(),
      path.parse(oldUri.path).name,
      path.parse(newUri.path).name,
    );

    if (result === "") {
      oldParent.entries.delete(entry.name);
      entry.name = newName;
      newParent.entries.set(newName, entry);

      this._fireSoon({ type: vscode.FileChangeType.Deleted, uri: oldUri }, { type: vscode.FileChangeType.Created, uri: newUri });
    } else {
      throw new Error("Failed to rename file. Please try again. Error: " + result);
    }
  }

  async delete(uri: vscode.Uri): Promise<void> {
    const dirname = uri.with({ path: path.posix.dirname(uri.path) });
    const basename = path.posix.basename(uri.path);
    const parent = this._lookupAsDirectory(dirname, false);

    // Make sure user isn't attempting to delete an ERF
    const target = parent.entries.get(basename);

    if (!target) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }
    if (target instanceof Directory) {
      throw new Error("Cannot delete ERFs from VS Code.");
    }

    // Verify our folder is correctly associated with an ERF
    if (!parent.erf) {
      throw new Error("Invalid ERF");
    }

    const result = await this.remoteAPI.deleteFile(parent.erf.id.toString(), path.parse(basename).name);

    if (result === "") {
      void vscode.window.showInformationMessage("File deleted successfully on server");

      parent.entries.delete(basename);
      parent.mtime = Date.now();
      parent.size -= 1;
      this._fireSoon({ type: vscode.FileChangeType.Changed, uri: dirname }, { uri, type: vscode.FileChangeType.Deleted });
    } else {
      void vscode.window.showInformationMessage("Unexpected error. Please try again (" + result + ")");
    }
  }

  async deleteVirtualFiles(uri: vscode.Uri): Promise<void> {
    const folder = this._lookupAsDirectory(uri, false);

    if (!folder || !(folder instanceof Directory)) {
      throw new Error("Not a valid ERF");
    }
    folder.entries.clear();
    this._fireSoon({ type: vscode.FileChangeType.Changed, uri }, { uri, type: vscode.FileChangeType.Deleted });
  }

  createDirectory(uri: vscode.Uri): void {
    void vscode.window.showWarningMessage(
      "Cannot create new directories. Please create a new ERF on the website instead if needed",
    );
  }

  /**
   * Use this function only when initializing new directories from the server
   * @param uri Uri of new directory to be created
   */
  createDirectoryInit(uri: vscode.Uri): void {
    const basename = path.posix.basename(uri.path);
    const dirname = uri.with({ path: path.posix.dirname(uri.path) });
    const parent = this._lookupAsDirectory(dirname, false);

    const entry = new Directory(basename);
    parent.entries.set(entry.name, entry);
    parent.mtime = Date.now();
    parent.size += 1;
    this._fireSoon({ type: vscode.FileChangeType.Changed, uri: dirname }, { type: vscode.FileChangeType.Created, uri });
  }

  // --- lookup

  private async _lookup(uri: vscode.Uri, silent: false): Promise<Entry>;
  private async _lookup(uri: vscode.Uri, silent: boolean): Promise<Entry | undefined>;
  private async _lookup(uri: vscode.Uri, silent: boolean): Promise<Entry | undefined> {
    console.log("lookup: " + uri.toString());

    let res: Entry | undefined;
    const parsedUri = this.parseUri(uri);
    if (parsedUri) res = await this.remoteAPI.lookup(parsedUri);

    if (!res) {
      if (!silent) {
        throw vscode.FileSystemError.FileNotFound(uri);
      } else {
        return undefined;
      }
    }

    return res;
    // for (const part of parts) {
    //   if (!part) {
    //     continue;
    //   }

    //   let child: Entry | undefined;
    //   if (entry instanceof Directory) {
    //     child = entry.entries.get(part);
    //   }
    //   if (!child) {
    //     if (!silent) {
    //       throw vscode.FileSystemError.FileNotFound(uri);
    //     } else {
    //       return undefined;
    //     }
    //   }
    //   entry = child;
    // }
    // return entry;
  }

  private parseUri(
    uri: vscode.Uri,
  ): { erfId: number; category: string; resref: string; fileExt: string; uri: vscode.Uri } | undefined {
    const parts = uri.path.split("/");
    let erfId: number;
    let category: string, resref: string, fileExt: string;
    if (parts.length === 4) {
      erfId = parseInt(parts[1]);
      category = parts[2];
      resref = parts[3];
      fileExt = uri.path.split(".").pop() || "";
    } else if (parts.length === 3) {
      erfId = parseInt(parts[1]);
      category = parts[2];
      resref = "";
      fileExt = "";
    } else if (parts.length === 2) {
      erfId = parseInt(parts[1]);
      category = "";
      resref = "";
      fileExt = "";
    } else {
      return undefined;
    }

    return { erfId, category, resref, fileExt, uri };
  }

  private _lookupAsDirectory(uri: vscode.Uri, silent: boolean): Directory {
    const entry = this._lookup(uri, silent);
    if (entry instanceof Directory) {
      return entry;
    }
    throw vscode.FileSystemError.FileNotADirectory(uri);
  }

  private _lookupAsFile(uri: vscode.Uri, silent: boolean): File {
    const entry = this._lookup(uri, silent);
    if (entry instanceof File) {
      return entry;
    }
    throw vscode.FileSystemError.FileIsADirectory(uri);
  }

  private _lookupParentDirectory(uri: vscode.Uri): Directory {
    const dirname = uri.with({ path: path.posix.dirname(uri.path) });
    return this._lookupAsDirectory(dirname, false);
  }

  private _lookupERFDirectory(uri: vscode.Uri): Directory {
    const dirname = uri.with({ path: path.parse(path.parse(uri.path).dir).dir });
    return this._lookupAsDirectory(dirname, false);
  }

  // --- manage file events

  private readonly _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
  private readonly _bufferedEvents: vscode.FileChangeEvent[] = [];
  private _fireSoonHandle?: NodeJS.Timer;

  readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

  watch(_resource: vscode.Uri): vscode.Disposable {
    // ignore, fires for all changes...
    return new vscode.Disposable(() => {});
  }

  private _fireSoon(...events: vscode.FileChangeEvent[]): void {
    this._bufferedEvents.push(...events);

    if (this._fireSoonHandle) {
      clearTimeout(this._fireSoonHandle);
    }

    this._fireSoonHandle = setTimeout(() => {
      this._emitter.fire(this._bufferedEvents);
      this._bufferedEvents.length = 0;
    }, 5);
  }
}
