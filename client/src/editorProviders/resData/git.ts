export class Git {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  public getField(field: string) {
    return this._data.resData[1].AreaProperties[1][1][field];
  }

  public setField(field: string, value: string) {
    this._data.resData[1].AreaProperties[1][1][field][1] = value;
  }

  public get editableFields() {
    return this._data.extraData.editableFields;
  }
}
