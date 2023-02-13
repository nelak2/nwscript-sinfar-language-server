/* eslint-disable @typescript-eslint/no-invalid-void-type */
import * as vscode from "vscode";
import { SinfarAPI } from "../api/sinfarAPI";
import { SinfarFS } from "./fileSystemProvider";
import { ERF, ResourceType } from "../api/types";
import path from "path";

export class ERFTreeDataProvider implements vscode.TreeDataProvider<Entry> {
  private readonly remoteAPI: SinfarAPI;
  private readonly fs: SinfarFS;
  private readonly context: vscode.ExtensionContext;
  private readonly type: "all" | "open";
  private linked: ERFTreeDataProvider | undefined;
  private readonly openERFs: ERFEntry[] = [];

  private readonly _onDidChangeTreeData: vscode.EventEmitter<Entry | undefined | void> = new vscode.EventEmitter<
    Entry | undefined | void
  >();

  readonly onDidChangeTreeData: vscode.Event<Entry | undefined | void> = this._onDidChangeTreeData.event;

  constructor(remoteAPI: SinfarAPI, fs: SinfarFS, context: vscode.ExtensionContext, type: "all" | "open") {
    this.remoteAPI = remoteAPI;
    this.fs = fs;
    this.context = context;
    this.type = type;
  }

  public openERF(entry: Entry) {
    const erf = entry.data as ERFEntry;
    this.openERFs.push(erf);
    void this.refresh();
  }

  public setLinked(other: ERFTreeDataProvider) {
    this.linked = other;
  }

  getTreeItem(element: Entry): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  async getChildren(element?: Entry | undefined): Promise<Entry[] | null | undefined> {
    if (element?.contextValue === "erf") return await this.getResGroups(element);

    if (element?.contextValue === "resourceGroup") return await this.getResources(element);

    if (!element) {
      if (this.type === "open") return await this.getOpenERFEntries();
      if (this.type === "all") return await this.getERFEntries();
    }
  }

  private async getResources(element: Entry): Promise<Entry[]> {
    const erf = (element.data as ResourceGroupEntry).erf;
    const resourceType = (element.data as ResourceGroupEntry).groupType;
    const resources = (element.data as ResourceGroupEntry).resources;

    if (!resources) {
      return [];
    }

    const entries = resources.map(
      (resource) => new Entry(vscode.TreeItemCollapsibleState.None, new ResourceEntry(erf, resourceType, resource)),
    );

    return entries.sort((a, b) => (a.label?.toString() || "").localeCompare(b.label?.toString() || ""));
  }

  private async getResGroups(element: Entry): Promise<Entry[]> {
    const erf = (element.data as ERFEntry).erf;

    if (!erf.resources) {
      return [];
    }

    const properties = Object.entries(erf.resources);

    const entries: Entry[] = [];

    for (const property of properties) {
      entries.push(
        new Entry(vscode.TreeItemCollapsibleState.Collapsed, new ResourceGroupEntry(erf, property[0] as ResourceType)),
      );
    }

    return entries;
  }

  private async getERFEntries(): Promise<Entry[]> {
    const erfList = await this.remoteAPI.getAllResources();

    if (typeof erfList === "string") {
      void vscode.window.showErrorMessage(erfList);
      return [];
    }

    const entries = erfList.map((erf) => new Entry(vscode.TreeItemCollapsibleState.Collapsed, new ERFEntry(erf)));

    return entries.sort((a, b) => (a.label?.toString() || "").localeCompare(b.label?.toString() || ""));
  }

  private async getOpenERFEntries(): Promise<Entry[]> {
    const entries = this.openERFs.map((erf) => new Entry(vscode.TreeItemCollapsibleState.Collapsed, erf));

    return entries.sort((a, b) => (a.label?.toString() || "").localeCompare(b.label?.toString() || ""));
  }

  getParent?(element: Entry): vscode.ProviderResult<Entry> {
    throw new Error("Method not implemented.");
  }

  public async refresh(): Promise<void> {
    this._onDidChangeTreeData.fire();
  }

  //   resolveTreeItem?(
  //     item: vscode.TreeItem,
  //     element: Entry,
  //     token: vscode.CancellationToken,
  //   ): vscode.ProviderResult<vscode.TreeItem> {
  //     throw new Error("Method not implemented.");
  //   }

  onDidCollapseElement(e: vscode.TreeViewExpansionEvent<Entry>): any {
    e.element.iconPath = e.element.data.getIconPath(false);
    void this.refresh();
  }

  onDidExpandElement(e: vscode.TreeViewExpansionEvent<Entry>): any {
    e.element.iconPath = e.element.data.getIconPath(true);
    void this.refresh();
  }
}

export class Entry extends vscode.TreeItem {
  constructor(public collapsibleState: vscode.TreeItemCollapsibleState, public readonly data: EntryInterface) {
    super(data.label, collapsibleState);
    this.tooltip = data.tooltip;
    this.description = data.description;
    this.contextValue = data.contextValue;
    this.command = data.command;
    this.iconPath = data.getIconPath(false);
  }
}

export type EntryInterface = {
  label: string;
  description?: string;
  tooltip?: string | vscode.MarkdownString;
  getIconPath: (state: boolean) => { light: string; dark: string };
  contextValue?: string;
  command?: vscode.Command;
};

export class ERFEntry implements EntryInterface {
  public label: string;
  public description?: string | undefined;
  public tooltip?: string | vscode.MarkdownString | undefined;
  public contextValue?: string | undefined;
  public command?: vscode.Command | undefined;
  public erf: ERF;

  constructor(erf: ERF) {
    this.erf = erf;
    this.label = `${erf.prefix} - ${erf.title}`;
    this.description = `${this.countResources(erf).toString()} resources`;
    this.tooltip = new vscode.MarkdownString(
      `<span style="color:#9cdcfe;">ID:</span> ${erf.id}<br>
        <span style="color:#9cdcfe;">Prefix:</span> ${erf.prefix}<br>
        <span style="color:#9cdcfe;">Owner:</span> ${erf.ownerName}<br>
        <span style="color:#9cdcfe;">Description:</span><br>${erf.description}`,
    );
    this.tooltip.supportHtml = true;
    this.contextValue = "erf";

    this.command = { command: "sinfar.openERF", title: "Open ERF", arguments: [this] };
  }

  public getIconPath(state: boolean): { light: string; dark: string } {
    if (state) {
      return {
        light: path.join(
          vscode.extensions.getExtension("NelaK.nwscript-sinfar-scripters-extension")?.extensionPath || "",
          "client/fileicons/erf_open.png",
        ),
        dark: path.join(
          vscode.extensions.getExtension("NelaK.nwscript-sinfar-scripters-extension")?.extensionPath || "",
          "client/fileicons/erf_open.png",
        ),
      };
    }
    return {
      light: path.join(
        vscode.extensions.getExtension("NelaK.nwscript-sinfar-scripters-extension")?.extensionPath || "",
        "client/fileicons/erf_closed.png",
      ),
      dark: path.join(
        vscode.extensions.getExtension("NelaK.nwscript-sinfar-scripters-extension")?.extensionPath || "",
        "client/fileicons/erf_closed.png",
      ),
    };
  }

  private countResources(erf: ERF): number {
    let count = 0;

    if (!erf.resources) return 0;

    const properties = Object.entries(erf.resources);

    for (const property of properties) {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      count += (property as any)[1].length;
    }

    return count;
  }
}

export class ResourceGroupEntry implements EntryInterface {
  label: string;
  description?: string | undefined;
  tooltip?: string | vscode.MarkdownString | undefined;
  contextValue?: string | undefined;
  command?: vscode.Command | undefined;

  erf: ERF;
  groupType: ResourceType;

  constructor(erf: ERF, groupType: ResourceType) {
    this.erf = erf;
    this.groupType = groupType;

    this.label = this.getLabel(groupType);

    const count = this.erf.resources?.[groupType]?.length || 0;
    this.description = `${count} resources`;
    this.tooltip = undefined;
    this.contextValue = "resourceGroup";
    this.command = undefined;
  }

  public get resources(): string[] {
    return this.erf.resources?.[this.groupType] || [];
  }

  public getIconPath(state: boolean): { light: string; dark: string } {
    const extPath = vscode.extensions.getExtension("NelaK.nwscript-sinfar-scripters-extension")?.extensionPath || "";
    const iconFolder = "client/fileicons/";

    let iconName = "";

    switch (this.groupType) {
      case ResourceType.UTC:
        iconName = "creature.png";
        break;
      case ResourceType.UTI:
        iconName = "item.png";
        break;
      case ResourceType.UTM:
        iconName = "merchant.png";
        break;
      case ResourceType.UTW:
        iconName = "waypoint.png";
        break;
      case ResourceType.UTP:
        iconName = "placeable.png";
        break;
      case ResourceType.UTE:
        iconName = "encounter.png";
        break;
      case ResourceType.DLG:
        iconName = "conversation.png";
        break;
      case ResourceType.ARE:
        iconName = "area.png";
        break;
      case ResourceType.GIT:
        iconName = "area.png";
        break;
      case ResourceType["2DA"]:
        iconName = "2da.png";
        break;
      case ResourceType.UTD:
        iconName = "door.png";
        break;
      case ResourceType.NSS:
        iconName = "script.png";
        break;
      case ResourceType.UTS:
        iconName = "sound.png";
        break;
      case ResourceType.UTT:
        iconName = "trigger.png";
        break;
      case ResourceType.IFO:
        iconName = "erf_closed.png";
        break;
    }

    return { light: path.join(extPath, iconFolder, iconName), dark: path.join(extPath, iconFolder, iconName) };
  }

  private getLabel(groupType: ResourceType): string {
    switch (groupType) {
      case ResourceType.UTC:
        return "Creatures";
      case ResourceType.UTI:
        return "Items";
      case ResourceType.UTM:
        return "Merchants";
      case ResourceType.UTW:
        return "Waypoints";
      case ResourceType.UTP:
        return "Placeables";
      case ResourceType.UTE:
        return "Encounters";
      case ResourceType.DLG:
        return "Conversations";
      case ResourceType.ARE:
        return "Areas";
      case ResourceType.GIT:
        return "GITs";
      case ResourceType["2DA"]:
        return "2DAs";
      case ResourceType.UTD:
        return "Doors";
      case ResourceType.NSS:
        return "Scripts";
      case ResourceType.UTS:
        return "Sounds";
      case ResourceType.UTT:
        return "Triggers";
      case ResourceType.IFO:
        return "Module";
    }
  }
}

export class ResourceEntry implements EntryInterface {
  label: string;
  description?: string | undefined;
  tooltip?: string | vscode.MarkdownString | undefined;
  contextValue?: string | undefined;
  command?: vscode.Command | undefined;

  erf: ERF;
  groupType: ResourceType;
  resource: string;

  constructor(erf: ERF, groupType: ResourceType, resource: string) {
    this.erf = erf;
    this.groupType = groupType;
    this.resource = resource;

    this.label = resource;
    this.description = undefined;
    this.tooltip = undefined;
    this.contextValue = "resource";
    this.command = undefined;
  }

  public getIconPath(state: boolean): { light: string; dark: string } {
    const extPath = vscode.extensions.getExtension("NelaK.nwscript-sinfar-scripters-extension")?.extensionPath || "";
    const iconFolder = "client/fileicons/";

    let iconName = "";

    switch (this.groupType) {
      case ResourceType.UTC:
        iconName = "creature.png";
        break;
      case ResourceType.UTI:
        iconName = "item.png";
        break;
      case ResourceType.UTM:
        iconName = "merchant.png";
        break;
      case ResourceType.UTW:
        iconName = "waypoint.png";
        break;
      case ResourceType.UTP:
        iconName = "placeable.png";
        break;
      case ResourceType.UTE:
        iconName = "encounter.png";
        break;
      case ResourceType.DLG:
        iconName = "conversation.png";
        break;
      case ResourceType.ARE:
        iconName = "area.png";
        break;
      case ResourceType.GIT:
        iconName = "area.png";
        break;
      case ResourceType["2DA"]:
        iconName = "2da.png";
        break;
      case ResourceType.UTD:
        iconName = "door.png";
        break;
      case ResourceType.NSS:
        iconName = "script.png";
        break;
      case ResourceType.UTS:
        iconName = "sound.png";
        break;
      case ResourceType.UTT:
        iconName = "trigger.png";
        break;
      case ResourceType.IFO:
        iconName = "erf_closed.png";
        break;
    }

    return { light: path.join(extPath, iconFolder, iconName), dark: path.join(extPath, iconFolder, iconName) };
  }
}
