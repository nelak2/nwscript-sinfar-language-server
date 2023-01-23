import { ResData, VarTable } from ".";
import { ipSubType, ipType, ipValueParamType, ipValueType } from "../../components/lists";

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

export type ItemProperty = {
  ChanceAppear: number;
  CostTable: number;
  CostValue: number;
  ValueParamType: number;
  ValueType: number;
  Property: number;
  SubType: number;
  PropertyName: string;
  ValueTypeName: string | null;
  ValueParamTypeName: string | null;
  SubTypeName: string | null;
};

class ItemProperties {
  private readonly _data: any;

  constructor(data: any) {
    this._data = data;
  }

  public getPropertyList(): ItemProperty[] {
    const properties: ItemProperty[] = [];

    for (const property of this._data.resData[1].PropertiesList[1]) {
      const prop: ItemProperty = {
        ChanceAppear: property[1].ChanceAppear[1],
        CostTable: property[1].CostTable[1],
        CostValue: property[1].CostValue[1],
        ValueParamType: property[1].Param1[1],
        ValueType: property[1].CostValue[1],
        Property: property[1].PropertyName[1],
        SubType: property[1].Subtype[1],
        PropertyName: this.GetPropertyName(property[1].PropertyName[1]),
        ValueTypeName: this.GetValueTypeName(property[1].PropertyName[1], property[1].CostValue[1]),
        ValueParamTypeName: this.GetValueParamTypeName(property[1].PropertyName[1], property[1].Param1[1]),
        SubTypeName: this.GetSubTypeName(property[1].PropertyName[1], property[1].Subtype[1]),
      };
      properties.push(prop);
    }

    return properties;
  }

  public GetPropertyName(property: number): string {
    return ipType.find((x) => x.value === property.toString())?.label || "Invalid Property";
  }

  public GetSubTypeName(property: number, subTypeID: number): string | null {
    const subType = ipType.find((x) => x.value === property.toString())?.subType;
    if (subType) {
      return ipSubType.find((x) => x.subType === subType && x.value === subTypeID.toString())?.label || null;
    }
    return null;
  }

  public GetValueTypeName(property: number, valueTypeID: number): string | null {
    const valueType = ipType.find((x) => x.value === property.toString())?.valueType;
    if (valueType) {
      return ipValueType.find((x) => x.valueType === valueType && x.value === valueTypeID.toString())?.label || null;
    }
    return null;
  }

  public GetValueParamTypeName(property: number, valueParamTypeID: number): string | null {
    const valueParamType = ipType.find((x) => x.value === property.toString())?.valueParamType;
    if (valueParamType) {
      return (
        ipValueParamType.find((x) => x.valueParamType === valueParamType && x.value === valueParamTypeID.toString())?.label ||
        null
      );
    }
    return null;
  }
}
