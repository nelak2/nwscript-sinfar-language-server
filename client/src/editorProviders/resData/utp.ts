import { ResData, VarTable } from ".";

export class Utp extends ResData {
  private readonly _vartable: VarTable;
  private readonly _inventoryList: InventoryList;

  constructor(resdata: any) {
    super(resdata);
    this._vartable = new VarTable(this._data);
    this._inventoryList = new InventoryList(this._data);
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
    let oldValue: string;
    try {
      oldValue = this._data.resData[1].ItemList[1][index][1].InventoryRes[1];
    } catch (e) {
      return undefined;
    }

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
    let oldValue: string;
    try {
      oldValue = this._data.resData[1].ItemList[1][index][1].InventoryRes[1];
    } catch (e) {
      return undefined;
    }

    this._data.resData[1].ItemList[1].splice(index, 1);
    return oldValue;
  }
}
