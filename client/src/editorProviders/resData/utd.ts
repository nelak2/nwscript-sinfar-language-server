export class Utd {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  public get editableFields() {
    return this._data.editableFields.concat("AppearanceType");
  }

  public getField(field: string) {
    switch (field) {
      case "AppearanceType": {
        if (this._data.resData[1].Appearance[1] === 0) return [4, 1];
        return [4, 0];
      }
      case "Appearance": {
        if (this._data.resData[1].Appearance[1] === 0) return this._data.resData[1].GenericType_New;
        return this._data.resData[1].Appearance;
      }
      default: {
        return this._data.resData[1][field];
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
        this._data.resData[1][field][1] = value;
      }
    }
  }
}
