import { ResData, VarTable } from ".";
import { Feats, Spells } from "../../components/lists";

export class Utc extends ResData {
  private readonly _vartable: VarTable;
  private readonly _inventoryList: InventoryList;
  private readonly _featList: FeatList;
  private readonly _abilityList: AbilityList;
  private readonly _spellList: SpellList;

  constructor(resdata: any) {
    super(resdata);
    this._vartable = new VarTable(this._data);
    this._inventoryList = new InventoryList(this._data);
    this._featList = new FeatList(this._data);
    this._abilityList = new AbilityList(this._data);
    this._spellList = new SpellList(this._data);
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
    fields.push("equipped_1");
    fields.push("equipped_2");
    fields.push("equipped_4");
    fields.push("equipped_8");
    fields.push("equipped_16");
    fields.push("equipped_32");
    fields.push("equipped_64");
    fields.push("equipped_128");
    fields.push("equipped_256");
    fields.push("equipped_512");
    fields.push("equipped_1024");
    fields.push("equipped_2048");
    fields.push("equipped_4096");
    fields.push("equipped_8192");
    fields.push("equipped_16384");
    fields.push("equipped_32768");
    fields.push("equipped_65536");
    fields.push("equipped_131072");

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

      if (field.includes("equipped_")) {
        const equippedId = parseInt(field.substring(9));

        for (const item of this.data.resData[1].Equip_ItemList[1]) {
          if (item[0] === equippedId) return this.readField(item[1].EquippedRes);
        }
      }

      return this.readField(this.data.resData[1][field]);
    } catch (e) {
      return null;
    }
  }

  // TODO We may have an issue with spell lists for classes that are not actually assigned...
  private setClass(id: number, value: string) {
    // Delete the class if the value is -1 and the class is not the first class
    if (value === "-1" && id > 0) {
      this.data.resData[1].ClassList[1].splice(id, 1);
      return;
    }
    const currentclass = this.data.resData[1].ClassList[1][id];
    if (!currentclass) {
      this.data.resData[1].ClassList[1][id] = [2, { Class: [5, parseInt(value)], ClassLevel: [3, 1] }];
    } else {
      // If the class is changing, we need to update the spell list
      if (currentclass[1].Class[1] !== parseInt(value)) {
        this._spellList.clearList(id);
      }

      this.data.resData[1].ClassList[1][id][1].Class[1] = this.writeField(
        value,
        this.data.resData[1].ClassList[1][id][1].Class[0],
      );
    }
  }

  private setClassLevel(id: number, value: string) {
    this.data.resData[1].ClassList[1][id][1].ClassLevel[1] = this.writeField(
      value,
      this.data.resData[1].ClassList[1][id][1].ClassLevel[0],
    );
  }

  public setField(field: string, value: string) {
    if (field.includes("classlevel")) {
      const classId = parseInt(field.substring(10));
      this.setClassLevel(classId, value);
      return;
    }
    if (field.includes("class")) {
      const classId = parseInt(field.substring(5));
      this.setClass(classId, value);
      return;
    }
    if (field.includes("skill")) {
      const skillId = parseInt(field.substring(5));
      this.data.resData[1].SkillList[1][skillId][1].Rank[1] = this.writeField(
        value,
        this.data.resData[1].SkillList[1][skillId][1].Rank[0],
      );
      return;
    }

    if (field.includes("equipped_")) {
      const equippedId = parseInt(field.substring(9));

      for (const item of this.data.resData[1].Equip_ItemList[1]) {
        if (item[0] === equippedId) {
          item[1].EquippedRes[1] = this.writeField(value, item[1].EquippedRes[0]);
        }
      }
      return;
    }

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

  public get AbilityList() {
    return this._abilityList;
  }

  public get SpellList() {
    return this._spellList;
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

export enum Metamagic {
  None = 0,
  Empower = 1,
  Extend = 2,
  Maximize = 4,
  Quicken = 8,
  Silent = 16,
  Still = 32,
}

export enum SpellCastingClass {
  Bard = 1,
  Cleric = 2,
  Druid = 3,
  Paladin = 6,
  Ranger = 7,
  Sorcerer = 9,
  Wizard = 10,
  Invalid = -1,
}

export type Spell = {
  spell: number;
  class: SpellCastingClass;
  uses: number;
  metamagic: Metamagic;
  level: number;
};

class SpellList {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  public getSpellList(): Spell[] {
    const spells: Spell[] = [];

    for (const pcClass of this._data.resData[1].ClassList[1]) {
      const classId: number = pcClass[1].Class[1];

      const properties = Object.keys(pcClass[1]);

      for (const property of properties) {
        if (property.includes("MemorizedList")) {
          const spellLists = pcClass[1][property][1];

          for (const spell of spellLists) {
            const spellId = spell[1].Spell[1];
            // const spellFlags = spell[1].SpellFlags[1];
            const spellMetaMagic = spell[1].SpellMetaMagic[1];

            // check if the spell exists in our list. Each use of a spell is a separate entry
            const exists = spells.findIndex((s) => s.spell === spellId && s.class === classId && s.metamagic === spellMetaMagic);

            if (exists === -1) {
              const level = this.getSpellLevel(spellId, classId, spellMetaMagic);
              spells.push({ spell: spellId, class: classId, uses: 1, metamagic: spellMetaMagic, level });
            } else {
              spells[exists].uses++;
            }
          }
        }
      }
    }
    return spells;
  }

  clearList(classId: number) {
    const properties = Object.keys(this._data.resData[1].ClassList[1][classId][1]);
    for (const property of properties) {
      if (property.includes("MemorizedList")) {
        this._data.resData[1].ClassList[1][classId][1][property][1] = [];
      }
    }
  }

  public removeSpell(deleteSpell: Spell): boolean {
    let removedCount = 0;

    for (const pcClass of this._data.resData[1].ClassList[1]) {
      const classId: number = pcClass[1].Class[1];

      if (classId !== deleteSpell.class) continue;

      const properties = Object.keys(pcClass[1]);

      for (const property of properties) {
        if (property.includes("MemorizedList")) {
          const spellLists = pcClass[1][property][1];

          for (let i = spellLists.length - 1; i >= 0; i--) {
            if (spellLists[i][1].Spell[1] === deleteSpell.spell && spellLists[i][1].SpellMetaMagic[1] === deleteSpell.metamagic) {
              spellLists.splice(i, 1);
              removedCount++;
            }
          }
        }
      }
    }

    return removedCount > 0;
  }

  public addSpell(spell: Spell): boolean {
    // First remove the spell if it already exists
    this.removeSpell(spell);

    for (const pcClass of this._data.resData[1].ClassList[1]) {
      const classId: number = pcClass[1].Class[1];

      if (classId !== spell.class) continue;

      let spellList = pcClass[1][`MemorizedList${spell.level}`];

      if (!spellList) {
        pcClass[1][`MemorizedList${spell.level}`] = [15, []];
        spellList = pcClass[1][`MemorizedList${spell.level}`];
      }

      for (let i = 0; i < spell.uses; i++) {
        spellList[1].push([3, { Spell: [2, spell.spell], SpellFlags: [0, 1], SpellMetaMagic: [0, spell.metamagic] }]);
      }

      return true;
    }

    return false;
  }

  public getSpellLevel(spellID: number, classID: SpellCastingClass, metamagic: Metamagic): number {
    const spellData = Spells.find((s) => s.value === spellID);

    if (!spellData) return -1;

    switch (classID) {
      case SpellCastingClass.Bard:
        if (spellData.Bard === -1) return -1;
        return spellData.Bard + this.getMetamagicLevel(metamagic);
      case SpellCastingClass.Cleric:
        if (spellData.Cleric === -1) return -1;
        return spellData.Cleric + this.getMetamagicLevel(metamagic);
      case SpellCastingClass.Druid:
        if (spellData.Druid === -1) return -1;
        return spellData.Druid + this.getMetamagicLevel(metamagic);
      case SpellCastingClass.Paladin:
        if (spellData.Paladin === -1) return -1;
        return spellData.Paladin + this.getMetamagicLevel(metamagic);
      case SpellCastingClass.Ranger:
        if (spellData.Ranger === -1) return -1;
        return spellData.Ranger + this.getMetamagicLevel(metamagic);
      case SpellCastingClass.Sorcerer:
      case SpellCastingClass.Wizard:
        if (spellData.WizSorc === -1) return -1;
        return spellData.WizSorc + this.getMetamagicLevel(metamagic);
      default:
        return -1;
    }
  }

  public getMetamagicLevel(metamagic: Metamagic): number {
    switch (metamagic) {
      case Metamagic.Extend:
      case Metamagic.Still:
      case Metamagic.Silent:
        return 1;
      case Metamagic.Empower:
        return 2;
      case Metamagic.Maximize:
        return 3;
      case Metamagic.Quicken:
        return 4;
      default:
        return 0;
    }
  }
}

export type Ability = {
  spell: number;
  spellcasterlevel: number;
  spellflags: number;
  uses: number;
};

class AbilityList {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  public getAbilityList(): Ability[] {
    const abilities: Ability[] = [];

    for (const ability of this._data.resData[1].SpecAbilityList[1]) {
      const spell: number = ability[1].Spell[1];
      const spellcasterlevel: number = ability[1].SpellCasterLevel[1];
      const spellflags: number = ability[1].SpellFlags[1];

      // each usage of an ability is a separate entry in the list
      const existingAbility = abilities.findIndex((a) => a.spell === spell);

      // if it already exists in the list, increment the uses
      if (existingAbility !== -1) {
        abilities[existingAbility].uses++;
      } else {
        abilities.push({ spell, spellcasterlevel, spellflags, uses: 1 });
      }
    }

    return abilities;
  }

  public addAbility(newValue: Ability): boolean {
    // Remove the ability first if it already exists
    this.deleteAbilityBySpellID(newValue.spell);

    // Add the ability
    for (let i = 0; i < newValue.uses; i++) {
      const ability = [
        4,
        { Spell: [2, newValue.spell], SpellCasterLevel: [0, newValue.spellcasterlevel], SpellFlags: [0, newValue.spellflags] },
      ];
      this._data.resData[1].SpecAbilityList[1].push(ability);
    }

    return true;
  }

  public deleteAbilityBySpellID(spellID: number): boolean {
    this._data.resData[1].SpecAbilityList[1] = this._data.resData[1].SpecAbilityList[1].filter(
      (e: any) => e[1].Spell[1] !== spellID,
    );

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
