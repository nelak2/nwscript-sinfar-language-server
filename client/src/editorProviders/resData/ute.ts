import { ResData, VarTable } from ".";

export class Ute extends ResData {
  private readonly _vartable: VarTable;
  private readonly _inventoryList: CreatureList;

  constructor(resdata: any) {
    super(resdata);
    this._vartable = new VarTable(this._data);
    this._inventoryList = new CreatureList(this._data);
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

  public get CreatureList() {
    return this._inventoryList;
  }
}

class CreatureList {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  public getItemList(): CreatureListItem[] {
    const creatures: CreatureListItem[] = [];

    // verify the creature list exists
    if (!this._data.resData[1].CreatureList) {
      return creatures;
    }

    for (const creature of this._data.resData[1].CreatureList[1]) {
      creatures.push(this.readItem(creature));
    }
    return creatures;
  }

  public getExists(resref: string): boolean {
    for (const creature of this._data.resData[1].CreatureList[1]) {
      if (creature[1].ResRef[1] === resref) return true;
    }
    return false;
  }

  /**
   * Add an item to the list. Returns undefined if item already exists.
   * @param item Item to add to the list
   * @returns Added item or undefined if item already exists
   */
  public addItem(item: CreatureListItem): CreatureListItem | undefined {
    // verify the creature list exists
    if (!this._data.resData[1].CreatureList) {
      this._data.resData[1].CreatureList = [15, []];
    }

    if (this.getExists(item.Resref)) return undefined;

    this._data.resData[1].CreatureList[1].push(this.writeItem(item));
    return item;
  }

  public updateItem(index: number, newValue: CreatureListItem): CreatureListItem | undefined {
    const oldValue = this.getItem(index);
    if (!oldValue) return undefined;

    this._data.resData[1].CreatureList[1][index][1] = this.writeItem(newValue);
    return oldValue;
  }

  public getItem(index: number): CreatureListItem | undefined {
    if (index < 0 || index >= this._data.resData[1].CreatureList[1].length) return undefined;
    const creature = this._data.resData[1].CreatureList[1][index];
    return this.readItem(creature);
  }

  public getItemByResRef(resref: string): CreatureListItem | undefined {
    for (const creature of this._data.resData[1].CreatureList[1]) {
      if (creature[1].ResRef[1] === resref) {
        return this.readItem(creature);
      }
    }
    return undefined;
  }

  public deleteItem(index: number): CreatureListItem | undefined {
    const oldValue = this.getItem(index);
    if (!oldValue) return undefined;

    this._data.resData[1].CreatureList[1].splice(index, 1);
    return oldValue;
  }

  private readItem(item: any): CreatureListItem {
    return {
      Resref: item[1].ResRef[1],
      CR: item[1].CR[1],
      Unique: item[1].SingleSpawn[1] === 1,
    };
  }

  private writeItem(item: CreatureListItem): any {
    return [
      0,
      {
        ResRef: [11, item.Resref],
        CR: [8, item.CR],
        SingleSpawn: [0, item.Unique ? 1 : 0],
      },
    ];
  }
}

export type CreatureListItem = {
  Resref: string;
  CR: number;
  Unique: boolean;
};
