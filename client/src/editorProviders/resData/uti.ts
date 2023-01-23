import { ResData, VarTable } from ".";

export class Uti extends ResData {
  private readonly _vartable: VarTable;
  private readonly _itemProperties: ItemProperties;

  constructor(resdata: any) {
    super(resdata);
    this._vartable = new VarTable(this._data);
    this._itemProperties = new ItemProperties(this._data);
  }

  public get editableFields() {
    const fields = this._data.editableFields;
    fields.push("simple_appearance");
    return fields;
  }

  public getField(field: string) {
    if (field === "AppearanceType") {
      const baseItem = this.readField(this.data.resData[1].BaseItem);
      return this.data.extraData.baseitems[baseItem].modelType;
    } else if (field === "simple_appearance") {
      return this.readField(this.data.resData[1].ModelPart1);
    } else {
      return this.readField(this.data.resData[1][field]);
    }
  }

  public setField(field: string, value: string) {
    this.data.resData[1][field][1] = this.writeField(value, this.data.resData[1][field][0]);
  }

  public get VarTable() {
    return this._vartable;
  }

  public get ItemProperties() {
    return this._itemProperties;
  }
}

class ItemProperties {
  private readonly _data: any;

  constructor(data: any) {
    this._data = data;
  }
}
