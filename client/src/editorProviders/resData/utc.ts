import { ResData, VarTable } from ".";
import { Feats } from "../../components/lists";

export class Utc extends ResData {
  private readonly _vartable: VarTable;
  private readonly _inventoryList: InventoryList;
  private readonly _featList: FeatList;

  constructor(resdata: any) {
    super(resdata);
    this._vartable = new VarTable(this._data);
    this._inventoryList = new InventoryList(this._data);
    this._featList = new FeatList(this._data);
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

  public get FeatList() {
    return this._featList;
  }
}

class FeatList {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  public getFeatList(): { id: number; name: string }[] {
    const feats: { id: number; name: string }[] = [];

    for (const feat of this._data.resData[1].FeatList[1]) {
      const featId: number = feat[1].Feat[1];
      const featIdStr: string = featId.toString();
      feats.push({ name: this.getFeatName(featIdStr) ?? featIdStr, id: featId });
    }
    return feats;
  }

  public getFeatName(id: string): string | undefined {
    return Feats.find((f) => f.value === id)?.label;
  }

  public addFeat(id: number): Boolean {
    // Don't add the feat if it already exists
    if (this.getFeatExists(id)) return false;

    const feat = [1, { Feat: [2, id] }];
    this._data.resData[1].FeatList[1].push(feat);

    return true;
  }

  private getFeatExists(id: number): Boolean {
    return this._data.resData[1].FeatList[1].some((feat: any) => feat[1].Feat[1] === id);
  }

  public getFeatByID(id: number): number | undefined {
    return this._data.resData[1].FeatList[1].find((feat: any) => feat[1].Feat[1] === id);
  }

  public getFeatByIndex(index: number): number | undefined {
    return this._data.resData[1].FeatList[1][index][1].Feat[1];
  }

  public removeFeatByID(id: number): Boolean {
    const feat = this.getFeatByID(id);
    if (!feat) return false;

    const index = this._data.resData[1].FeatList[1].indexOf(feat);

    return this.deleteFeat(index);
  }

  public removeFeatByIndex(index: number): Boolean {
    const feat = this.getFeatByIndex(index);
    if (!feat) return false;

    return this.deleteFeat(index);
  }

  private deleteFeat(index: number): Boolean {
    this._data.resData[1].FeatList[1].splice(index, 1);

    return true;
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
      let itemStr: string = item[1].InventoryRes[1];

      if (item[1].Dropable[1] === 1) itemStr += " (Dropable)";
      if (item[1].Pickpocketable[1] === 1) itemStr += " (Pickpocketable)";

      items.push(itemStr);
    }
    return items;
  }

  public addItem(resref: string, dropable: boolean, pickpocketable: boolean): Boolean {
    const item = [
      0,
      { Dropable: [0, dropable ? 1 : 0], InventoryRes: [11, resref], Pickpocketable: [0, pickpocketable ? 1 : 0] },
    ];
    this._data.resData[1].ItemList[1].push(item);

    return true;
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
