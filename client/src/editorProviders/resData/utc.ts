import { ResData, VarTable } from ".";

export class Utc extends ResData {
  private readonly _vartable: VarTable;

  constructor(resdata: any) {
    super(resdata);
    this._vartable = new VarTable(this._data);
  }

  public get editableFields() {
    return this._data.editableFields;
  }

  public getField(field: string) {
    try {
      return this.readField(this.data.resData[1][field]);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  public setField(field: string, value: string) {
    this.data.resData[1][field][1] = this.writeField(value, this.data.resData[1][field][0]);
  }

  public get VarTable() {
    return this._vartable;
  }
}
