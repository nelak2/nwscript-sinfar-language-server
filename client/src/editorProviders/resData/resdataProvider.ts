import { EditorTypes, GFFType } from "../../api/types";
import { Are } from "./are";
import { Git } from "./git";
import { Utt } from "./utt";
import { Utd } from "./utd";
import { VarTable } from "./varTable";

// Wrapper class for the resdata object
// Provides access to the different parts of the resdata object
export class ResData {
  private readonly _data: any;

  public git: Git;
  public are: Are;
  public uti: Uti;
  public utc: Utc;
  public utp: Utp;
  public ute: Ute;
  public utt: Utt;
  public utm: Utm;
  public utd: Utd;
  public utw: Utw;
  public uts: Uts;
  public variables: VarTable;

  public type: EditorTypes;

  constructor(content: any, type: EditorTypes) {
    this._data = content;
    this.type = type;

    this.git = new Git(this._data);
    this.are = new Are(this._data);
    this.uti = new Uti(this._data);
    this.utc = new Utc(this._data);
    this.utp = new Utp(this._data);
    this.ute = new Ute(this._data);
    this.utt = new Utt(this._data);
    this.utm = new Utm(this._data);
    this.utd = new Utd(this._data);
    this.utw = new Utw(this._data);
    this.uts = new Uts(this._data);
    this.variables = new VarTable(this._data);
  }

  public get editableFields() {
    return this[this.type].editableFields;
  }

  public setField(field: string, value: string) {
    this[this.type].setField(field, value);
  }

  public getField(field: string): string {
    // should return the entire gff field (not just the value)
    const value = this[this.type].getField(field);

    this.debugLog(field, value);

    // special handling for gff string array types
    if (value[0] === 12) {
      return value[1].s0;
    }

    return value[1];
  }

  public get data() {
    return this._data;
  }

  public static getEditorType(resName: string): EditorTypes {
    const resType = resName.split(".")[1];
    switch (resType) {
      case "are":
        return EditorTypes.ARE;
      case "git":
        return EditorTypes.GIT;
      case "utc":
        return EditorTypes.UTC;
      case "utd":
        return EditorTypes.UTD;
      case "utp":
        return EditorTypes.UTP;
      case "utt":
        return EditorTypes.UTT;
      case "utw":
        return EditorTypes.UTW;
      case "uts":
        return EditorTypes.UTS;
      case "ute":
        return EditorTypes.UTE;
      case "utm":
        return EditorTypes.UTM;
      case "uti":
        return EditorTypes.UTI;
    }

    throw new Error("Unknown Editor Type");
  }

  private debugLog(field: string, value: any) {
    const type: string = GFFType[value[0]];

    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    console.log("Field: " + field + " Type: " + type + " Value: " + value[1]);
  }
}

class Uti {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  public get editableFields() {
    throw new Error("Not implemented");
  }

  public getField(field: string) {
    throw new Error("Not implemented");
  }

  public setField(field: string, value: string) {
    throw new Error("Not implemented");
  }
}

class Utc {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  public get editableFields() {
    throw new Error("Not implemented");
  }

  public getField(field: string) {
    throw new Error("Not implemented");
  }

  public setField(field: string, value: string) {
    throw new Error("Not implemented");
  }
}

class Utp {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  public get editableFields() {
    throw new Error("Not implemented");
  }

  public getField(field: string) {
    throw new Error("Not implemented");
  }

  public setField(field: string, value: string) {
    throw new Error("Not implemented");
  }
}

class Ute {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  public get editableFields() {
    throw new Error("Not implemented");
  }

  public getField(field: string) {
    throw new Error("Not implemented");
  }

  public setField(field: string, value: string) {
    throw new Error("Not implemented");
  }
}

class Utm {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  public get editableFields() {
    throw new Error("Not implemented");
  }

  public getField(field: string) {
    throw new Error("Not implemented");
  }

  public setField(field: string, value: string) {
    throw new Error("Not implemented");
  }
}

class Utw {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  public get editableFields() {
    throw new Error("Not implemented");
  }

  public getField(field: string) {
    throw new Error("Not implemented");
  }

  public setField(field: string, value: string) {
    throw new Error("Not implemented");
  }
}

class Uts {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  public get editableFields() {
    throw new Error("Not implemented");
  }

  public getField(field: string) {
    throw new Error("Not implemented");
  }

  public setField(field: string, value: string) {
    throw new Error("Not implemented");
  }
}
