import { ResData, VarTable } from ".";

export class Uts extends ResData {
  private readonly _vartable: VarTable;
  private readonly _soundList: SoundList;

  constructor(resdata: any) {
    super(resdata);
    this._vartable = new VarTable(this._data);
    this._soundList = new SoundList(this._data);
  }

  public get editableFields() {
    return this._data.editableFields;
  }

  public getField(field: string) {
    return this.readField(this.data.resData[1][field]);
  }

  public setField(field: string, value: string) {
    this.data.resData[1][field][1] = this.writeField(value, this.data.resData[1][field][0]);
  }

  public get VarTable(): VarTable {
    return this._vartable;
  }

  public get SoundList() {
    return this._soundList;
  }
}

class SoundList {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }
}
