import { ResData, VarTable } from ".";

export class Git extends ResData {
  private readonly _vartable: VarTable;
  constructor(resdata: any) {
    super(resdata);
    this._vartable = new VarTable(this._data);
  }

  public getField(field: string) {
    return this.readField(this._data.resData[1].AreaProperties[1][1][field]);
  }

  public setField(field: string, value: string) {
    this._data.resData[1].AreaProperties[1][1][field][1] = this.writeField(
      value,
      this._data.resData[1].AreaProperties[1][1][field][0],
    );
  }

  public get editableFields() {
    return this._data.extraData.editableFields;
  }

  public get VarTable(): VarTable {
    return this._vartable;
  }
}
