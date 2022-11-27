import * as path from "path";
import * as vscode from "vscode";
import { ERF, SinfarAPI } from "./sinfarAPI";

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
  remoteAPI = new SinfarAPI();

  // --- manage file metadata

  stat(uri: vscode.Uri): vscode.FileStat {
    return this._lookup(uri, false);
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
  findFile(name: string): vscode.Uri {
    for (const erf of this.root.entries) {
      if (erf[1] instanceof Directory) {
        if (erf[1].erf?.resources?.nss?.includes(path.parse(name).name)) {
          return vscode.Uri.from({ scheme: "sinfar", path: `/${erf[1].name}/${path.parse(name).name}` + ".nss" });
        }
      }
    }
    return vscode.Uri.parse(name);
  }

  // --- manage file contents

  async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    const resref = path.parse(uri.path).name;

    const enc = await this.remoteAPI.readFile(resref);

    // Store the downloaded script
    const basename = path.posix.basename(uri.path);
    const parent = this._lookupParentDirectory(uri);
    const entry = parent.entries.get(basename);
    if (entry && entry instanceof File) {
      entry.size = enc.byteLength;
      entry.data = enc;
    }

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
    let basename = path.posix.basename(uri.path);
    const parent = this._lookupParentDirectory(uri);
    let entry = parent.entries.get(basename);

    if (entry instanceof Directory) {
      throw vscode.FileSystemError.FileIsADirectory(uri);
    }
    if (!entry && !options.create) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }
    if (entry && options.create && !options.overwrite) {
      throw vscode.FileSystemError.FileExists(uri);
    }
    // Create new file
    if (!entry) {
      if (!parent.erf) {
        throw new Error("Invalid ERF");
      }

      const scriptPrefix = basename.split("_")[0];
      if (!options.initializing && scriptPrefix !== parent.erf.prefix) {
        throw new Error("All resource prefixes must match the parent ERF prefix");
      }

      // Ensure files in the VFS are always created with an nss extension so the language server can
      // pick them up
      basename = path.parse(basename).name + ".nss";

      // Check for resref name length. It is limited to 16 characters + 4 characters for the file extension
      if (basename.length > 20) {
        // Special handling for a few resources on Sinfar that are longer than the resref limit
        if (!options.initializing) {
          throw new Error("Resrefs can be a maximum of 16 characters. Try again");
        }
      }

      entry = new File(basename);
      parent.entries.set(basename, entry);
      this._fireSoon({ type: vscode.FileChangeType.Created, uri });
    }

    // Update virtual file
    entry.mtime = Date.now();
    entry.size = content.byteLength;
    entry.data = content;

    // The virtual file system is initialized with empty files to avoid excessive server requests.
    // The actual file contents are downloaded when the file is read. We want to ensure that we
    // don't accidentally upload these empty files to the server. If the localOnly flag is not set
    // then writeFile() is not being called from our initialization functions and therefore we can
    // safely upload the files to the server.
    if (!options.initializing) {
      // Verify our folder is correctly associated with an ERF
      if (!parent.erf) {
        throw new Error("Invalid ERF");
      }
      await this.remoteAPI.writeFile(parent.erf.id.toString(), uri, content, this);
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
    if (!options.overwrite && this._lookup(newUri, true)) {
      throw vscode.FileSystemError.FileExists(newUri);
    }

    const entry = this._lookup(oldUri, false);
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

  private _lookup(uri: vscode.Uri, silent: false): Entry;
  private _lookup(uri: vscode.Uri, silent: boolean): Entry | undefined;
  private _lookup(uri: vscode.Uri, silent: boolean): Entry | undefined {
    const parts = uri.path.split("/");
    let entry: Entry = this.root;
    for (const part of parts) {
      if (!part) {
        continue;
      }

      let child: Entry | undefined;
      if (entry instanceof Directory) {
        child = entry.entries.get(part);
      }
      if (!child) {
        if (!silent) {
          throw vscode.FileSystemError.FileNotFound(uri);
        } else {
          return undefined;
        }
      }
      entry = child;
    }
    return entry;
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

  // --- manage file events

  private readonly _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
  private _bufferedEvents: vscode.FileChangeEvent[] = [];
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
