import { ResData, VarTable } from ".";

export class Utd extends ResData {
  private readonly _vartable: VarTable;

  constructor(resdata: any) {
    super(resdata);
    this._vartable = new VarTable(this._data);
  }

  public get editableFields() {
    return this._data.editableFields.concat("AppearanceType");
  }

  public getField(field: string) {
    switch (field) {
      case "AppearanceType": {
        if (this._data.resData[1].Appearance[1] === 0) return this.readField([4, 1]);
        return this.readField([4, 0]);
      }
      case "Appearance": {
        if (this._data.resData[1].Appearance[1] === 0) return this.readField(this._data.resData[1].GenericType_New);
        return this.readField(this._data.resData[1].Appearance);
      }
      default: {
        return this.readField(this._data.resData[1][field]);
      }
    }
  }

  public setField(field: string, value: string) {
    switch (field) {
      case "AppearanceType": {
        const appearanceType = parseInt(value);
        const appearanceValue = this.getField("Appearance");
        if (appearanceType === 0) {
          this._data.resData[1].Appearance[1] = appearanceValue;
          this._data.resData[1].GenericType_New[1] = 0;
        } else {
          this._data.resData[1].Appearance[1] = 0;
          this._data.resData[1].GenericType_New[1] = appearanceValue;
        }
        break;
      }
      case "Appearance": {
        const appearanceType = this.getField("AppearanceType");
        const appearanceValue = parseInt(value);
        if (appearanceType === 0) {
          this._data.resData[1].Appearance[1] = appearanceValue;
          this._data.resData[1].GenericType_New[1] = 0;
        } else {
          this._data.resData[1].Appearance[1] = 0;
          this._data.resData[1].GenericType_New[1] = appearanceValue;
        }
        break;
      }
      default: {
        this._data.resData[1][field][1] = this.writeField(value, this._data.resData[1][field][0]);
      }
    }
  }

  public get VarTable(): VarTable {
    return this._vartable;
  }
}
