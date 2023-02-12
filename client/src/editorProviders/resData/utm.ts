import { ResData, VarTable } from ".";

export class Utm extends ResData {
  private readonly _vartable: VarTable;
  private readonly _restrictionList: RestrictionList;
  private readonly _inventoryList: InventoryList;

  constructor(resdata: any) {
    super(resdata);
    this._vartable = new VarTable(this._data);
    this._restrictionList = new RestrictionList(this._data);
    this._inventoryList = new InventoryList(this._data);
  }

  public get editableFields() {
    const fields = this._data.editableFields;
    fields.push("RestrictionType");
    return fields;
  }

  public getField(field: string) {
    if (field === "RestrictionType") {
      switch (this._restrictionList.restrictionType) {
        case RestrictionType.WillNotBuy:
          return 1;
        case RestrictionType.WillOnlyBuy:
          return 2;
      }
    }

    return this.readField(this.data.resData[1][field]);
  }

  public setField(field: string, value: string) {
    if (field === "RestrictionType") {
      switch (parseInt(value)) {
        case 1:
          this._restrictionList.restrictionType = RestrictionType.WillNotBuy;
          break;
        case 2:
          this._restrictionList.restrictionType = RestrictionType.WillOnlyBuy;
          break;
      }
      return;
    }
    this.data.resData[1][field][1] = this.writeField(value, this.data.resData[1][field][0]);
  }

  public get VarTable() {
    return this._vartable;
  }

  public get RestrictionList() {
    return this._restrictionList;
  }

  public get InventoryList() {
    return this._inventoryList;
  }
}

enum RestrictionType {
  WillNotBuy = "WillNotBuy",
  WillOnlyBuy = "WillOnlyBuy",
}

class RestrictionList {
  private readonly _data: any;
  private _restrictionType: RestrictionType = RestrictionType.WillNotBuy;

  constructor(resdata: any) {
    this._data = resdata;

    if (this._data.resData[1].WillNotBuy[1].length === 0 && this._data.resData[1].WillOnlyBuy[1].length > 0) {
      this._restrictionType = RestrictionType.WillOnlyBuy;
    } else {
      this._restrictionType = RestrictionType.WillNotBuy;
    }
  }

  public set restrictionType(type: RestrictionType) {
    if (this._restrictionType === type) return;

    if (type === RestrictionType.WillNotBuy) {
      this._data.resData[1].WillNotBuy[1] = this._data.resData[1].WillOnlyBuy[1];
      this._data.resData[1].WillOnlyBuy[1] = [];
    } else {
      this._data.resData[1].WillOnlyBuy[1] = this._data.resData[1].WillNotBuy[1];
      this._data.resData[1].WillNotBuy[1] = [];
    }

    this._restrictionType = type;
  }

  public get restrictionType(): RestrictionType {
    return this._restrictionType;
  }

  private readItem(item: any): string {
    return item[1].BaseItem[1];
  }

  private writeItem(item: string): any {
    return [97869, { BaseItem: [5, parseInt(item)] }];
  }

  private getExists(input: string): boolean {
    for (const item of this._data.resData[1][this._restrictionType][1]) {
      if (item[1].BaseItem[1].toString() === input) return true;
    }
    return false;
  }

  public getItemList(): string[] {
    const items: string[] = [];

    // Verify that the restriction list exists
    if (!this._data.resData[1][this._restrictionType]) {
      return items;
    }

    for (const item of this._data.resData[1][this._restrictionType][1]) {
      items.push(this.readItem(item));
    }
    return items;
  }

  public addItem(item: string): string | undefined {
    // Verify that the restriction list exists
    if (!this._data.resData[1][this._restrictionType]) {
      this._data.resData[1][this._restrictionType] = [15, []];
    }

    if (this.getExists(item)) return undefined;

    this._data.resData[1][this._restrictionType][1].push(this.writeItem(item));
    return item.toString();
  }

  public updateItem(index: number, newValue: string): string | undefined {
    const oldValue = this.getItem(index);
    if (!oldValue) return undefined;

    this._data.resData[1][this._restrictionType][1][index] = this.writeItem(newValue);
    return oldValue;
  }

  public getItem(index: number): string | undefined {
    try {
      return this._data.resData[1][this.restrictionType][1][index][1].BaseItem[1];
    } catch (e) {
      return undefined;
    }
  }

  public deleteItem(index: number): string | undefined {
    const oldValue = this.getItem(index);
    if (!oldValue) return undefined;

    this._data.resData[1][this.restrictionType][1].splice(index, 1);
    return oldValue;
  }
}

export type InventoryItem = {
  Resref: string;
  Infinite: boolean;
  Category: number;
};

class InventoryList {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  private readItem(item: any, category: number): InventoryItem {
    return {
      Resref: item[1].InventoryRes[1],
      Infinite: item[1].Infinite[1] === 1,
      Category: category,
    };
  }

  private writeItem(item: InventoryItem): any {
    const infinite = item.Infinite ? 1 : 0;
    return [0, { Infinite: [0, infinite], InventoryRes: [11, item.Resref] }];
  }

  public getItemList(category: number): InventoryItem[] {
    const items: InventoryItem[] = [];

    // Verify the item list exists
    if (!this._data.resData[1].StoreList[1][category]) {
      return items;
    }

    for (const item of this._data.resData[1].StoreList[1][category][1].ItemList[1]) {
      items.push(this.readItem(item, category));
    }
    return items;
  }

  public addItem(item: InventoryItem, category: number): InventoryItem | undefined {
    if (this.getItemList(category).find((i) => i.Resref === item.Resref && i.Infinite)) return undefined;

    this._data.resData[1].StoreList[1][category][1].ItemList[1].push(this.writeItem(item));
    return item;
  }

  public updateItem(index: number, newValue: InventoryItem, category: number): InventoryItem | undefined {
    const oldValue = this.getItem(index, category);
    if (!oldValue) return undefined;

    this._data.resData[1].StoreList[1][category][1].ItemList[1][index] = this.writeItem(newValue);
    return oldValue;
  }

  public getItem(index: number, category: number): InventoryItem | undefined {
    try {
      return this.readItem(this._data.resData[1].StoreList[1][category][1].ItemList[1][index], category);
    } catch (e) {
      return undefined;
    }
  }

  public deleteItem(index: number, category: number): InventoryItem | undefined {
    const oldValue = this.getItem(index, category);
    if (!oldValue) return undefined;

    this._data.resData[1].StoreList[1][category][1].ItemList[1].splice(index, 1);
    return oldValue;
  }
}
