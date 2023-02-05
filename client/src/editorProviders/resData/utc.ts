import { ResData, VarTable } from ".";

export class Utc extends ResData {
  private readonly _vartable: VarTable;
  private readonly _inventoryList: InventoryList;

  constructor(resdata: any) {
    super(resdata);
    this._vartable = new VarTable(this._data);
    this._inventoryList = new InventoryList(this._data);
  }

  public get editableFields() {
    const fields = this._data.editableFields;
    fields.push("class0");
    fields.push("classlevel0");
    fields.push("class1");
    fields.push("classlevel1");
    fields.push("class2");
    fields.push("classlevel2");
    fields.push("FootstepType");

    // 28 skills from 0 to 27
    for (let i = 0; i < 28; i++) {
      fields.push("skill" + i.toString());
    }

    return fields;
  }

  public getField(field: string) {
    // UTC has a lot of optional fields so we aren't guaranteed to have a value for each field
    try {
      if (field === "class0") return this.readField(this.data.resData[1].ClassList[1][0][1].Class);
      if (field === "classlevel0") return this.readField(this.data.resData[1].ClassList[1][0][1].ClassLevel);
      if (field === "class1") return this.readField(this.data.resData[1].ClassList[1][1][1].Class);
      if (field === "classlevel1") return this.readField(this.data.resData[1].ClassList[1][1][1].ClassLevel);
      if (field === "class2") return this.readField(this.data.resData[1].ClassList[1][2][1].Class);
      if (field === "classlevel2") return this.readField(this.data.resData[1].ClassList[1][2][1].ClassLevel);

      if (field.includes("skill")) {
        const skillId = parseInt(field.substring(5));
        return this.readField(this.data.resData[1].SkillList[1][skillId][1].Rank);
      }

      return this.readField(this.data.resData[1][field]);
    } catch (e) {
      return null;
    }
  }

  public setField(field: string, value: string) {
    this.data.resData[1][field][1] = this.writeField(value, this.data.resData[1][field][0]);
  }

  public get VarTable() {
    return this._vartable;
  }

  public get InventoryList() {
    return this._inventoryList;
  }
}

class InventoryList {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  public getItemList(): string[] {
    const items: string[] = [];

    for (const item of this._data.resData[1].ItemList[1]) {
      items.push(item[1].InventoryRes[1]);
    }
    return items;
  }

  public addItem(item: string): string | undefined {
    this._data.resData[1].ItemList[1].push([0, { InventoryRes: [11, item] }]);
    return item;
  }

  public updateItem(index: number, newValue: string): string | undefined {
    const oldValue = this.getItem(index);
    if (!oldValue) return undefined;

    this._data.resData[1].ItemList[1][index] = [0, { InventoryRes: [11, newValue] }];
    return oldValue;
  }

  public getItem(index: number): string | undefined {
    try {
      return this._data.resData[1].ItemList[1][index][1].InventoryRes[1];
    } catch (e) {
      return undefined;
    }
  }

  public deleteItem(index: number): string | undefined {
    const oldValue = this.getItem(index);
    if (!oldValue) return undefined;

    this._data.resData[1].ItemList[1].splice(index, 1);
    return oldValue;
  }
}
