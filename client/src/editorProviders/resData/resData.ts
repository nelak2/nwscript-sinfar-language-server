import { VarTable } from ".";
import { GFFType } from "../../api/types";

export abstract class ResData {
  protected readonly _data: any;

  protected constructor(resdata: any) {
    this._data = resdata;
  }

  public abstract getField(field: string): any;
  public abstract setField(field: string, value: string): void;
  public abstract get editableFields(): string[];
  public abstract get VarTable(): VarTable;

  public get data() {
    return this._data;
  }

  // Convert the value to the correct type before writing it to the GFF
  protected writeField(value: string, type: GFFType): any {
    switch (type) {
      case GFFType.Byte:
      case GFFType.Char:
      case GFFType.Word:
      case GFFType.Short:
      case GFFType.Dword:
      case GFFType.Int:
      case GFFType.Dword64:
      case GFFType.Int64: {
        return parseInt(value);
      }
      case GFFType.Float: {
        return parseFloat(value);
      }
      case GFFType.Double: {
        return parseInt(value);
      }
      case GFFType.CExoString: {
        return value.toString();
      }
      case GFFType.Resref: {
        return value.toString().substring(0, 16);
      }
      case GFFType.CExoLocalizedString: {
        return { s0: value.toString() };
      }
      case GFFType.Void: {
        throw new Error("Not implemented");
      }
      case GFFType.Struct: {
        throw new Error("Not implemented");
      }
      case GFFType.List: {
        throw new Error("Not implemented");
      }
    }
  }

  protected readField(value: any): any {
    switch (value[0]) {
      case GFFType.CExoLocalizedString: {
        return value[1][this._data.langId];
      }
      default: {
        return value[1];
      }
    }
  }
}
