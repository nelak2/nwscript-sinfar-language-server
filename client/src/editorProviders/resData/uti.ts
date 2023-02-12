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
  DisplayName: string | null;
};

class ItemProperties {
  private readonly _data: any;

  constructor(data: any) {
    this._data = data;
  }

  public getPropertyList(): ItemProperty[] {
    const properties: ItemProperty[] = [];

    // verify that the property list exists
    if (!this._data.resData[1].PropertiesList) {
      return properties;
    }

    for (const property of this._data.resData[1].PropertiesList[1]) {
      const prop = this.readProperty(property);

      properties.push(prop);
    }

    return properties;
  }

  public readProperty(property: any): ItemProperty {
    const prop: ItemProperty = {
      ChanceAppear: property[1].ChanceAppear[1],
      CostTable: property[1].CostTable[1],
      CostValue: property[1].CostValue[1],
      ValueParamType: property[1].Param1[1],
      ValueType: property[1].Param1Value[1],
      Property: property[1].PropertyName[1],
      SubType: property[1].Subtype[1],
      DisplayName: null,
    };
    prop.DisplayName = this.GetDisplayName(prop);

    return prop;
  }

  public getProperty(index: number): ItemProperty | undefined {
    try {
      return this._data.resData[1].PropertiesList[1][index];
    } catch (e) {
      return undefined;
    }
  }

  public buildProperty(
    selType: string | null,
    selSubType: string | null,
    selValueType: string | null,
    selValueParamType: string | null,
  ): ItemProperty {
    if (selType === null) throw new Error("Invalid property type");
    const typeOption = ipType.find((x) => x.value === selType);
    if (!typeOption) throw new Error("Invalid property type");

    const propType = parseInt(selType);
    const subType = selSubType && typeOption.subType ? parseInt(selSubType) : 0;

    const costTable = parseInt(typeOption.valueType || "255");
    const costValue = typeOption.valueType && selValueType ? parseInt(selValueType) : 0;

    const costParamTable = parseInt(typeOption.valueParamType || "255");
    const costParamValue = typeOption.valueParamType && selValueParamType ? parseInt(selValueParamType) : 0;

    const newProperty: ItemProperty = {
      ChanceAppear: 100,
      CostTable: costTable,
      CostValue: costValue,
      ValueParamType: costParamTable,
      ValueType: costParamValue,
      Property: propType,
      SubType: subType,
      DisplayName: null,
    };
    newProperty.DisplayName = this.GetDisplayName(newProperty);

    return newProperty;
  }

  public addProperty(property: ItemProperty) {
    // verify the properties list exists
    if (!this._data.resData[1].PropertiesList) {
      this._data.resData[1].PropertiesList = [15, []];
    }

    this._data.resData[1].PropertiesList[1].push([
      0,
      {
        PropertyName: [2, property.Property],
        Subtype: [2, property.SubType],
        CostTable: [0, property.CostTable],
        CostValue: [2, property.CostValue],
        Param1: [0, property.ValueParamType],
        Param1Value: [0, property.ValueType],
        ChanceAppear: [0, 100],
      },
    ]);
  }

  public deleteProperty(index: number): ItemProperty | undefined {
    const oldValue = this.getProperty(index);
    if (!oldValue) return undefined;

    this._data.resData[1].PropertiesList[1].splice(index, 1);
    return oldValue;
  }

  public GetDisplayName(property: ItemProperty): string {
    let name = ipType.find((x) => x.value === property.Property.toString())?.displayString || "Error";

    if (property.SubType) {
      name += " ";
      name += this.GetSubTypeName(property.Property, property.SubType) || "Error";
    }

    if (property.CostTable !== 255) {
      name += " ";
      name += this.GetValueTypeName(property.Property, property.CostValue) || "Error";
    }

    if (property.ValueParamType !== 255) {
      name += " ";
      name += this.GetValueParamTypeName(property.Property, property.ValueType) || "Error";
    }

    return name;
  }

  public GetPropertyName(property: number): string {
    return ipType.find((x) => x.value === property.toString())?.label || "Error";
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
