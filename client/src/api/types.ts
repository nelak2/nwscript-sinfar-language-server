import * as vscode from "vscode";

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

export type Resource = {
  erfId: number;
  resName: string;
  resType: ResourceType;
  resData: any;
};

export type CompilerReturn = {
  location: vscode.Uri;
  diagnostics: vscode.Diagnostic[];
};

// All possible resource types
export enum ResourceType {
  UTC = "utc",
  UTI = "uti",
  UTM = "utm",
  UTW = "utw",
  UTP = "utp",
  UTE = "ute",
  DLG = "dlg",
  ARE = "are",
  GIT = "git",
  _2DA = "_2da",
  UTD = "utd",
  NSS = "nss",
  UTS = "uts",
  UTT = "utt",
  IFO = "ifo",
}

// Path: client\src\api\resdata.ts
// Used to define the structure of the resdata object
export enum EditorTypes {
  UTC = "utc",
  UTI = "uti",
  UTM = "utm",
  UTW = "utw",
  UTP = "utp",
  UTE = "ute",
  ARE = "are",
  GIT = "git",
  UTD = "utd",
  UTS = "uts",
  UTT = "utt",
}

// Used to define NWN variables and their types
export type Variable = {
  Name: string;
  Type: VariableType;
  Value: string | number;
};

export enum VariableType {
  Int = 1,
  Float = 2,
  String = 3,
}
