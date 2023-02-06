import { Utc } from "../editorProviders/resData";
import { Metamagic, Spell, SpellCastingClass } from "../editorProviders/resData/utc";
import { Spells } from "./lists";
import { SpellData } from "./lists/spells";
import { buildTextField, ButtonType } from "./utils";

export class nwnCreatureSpells extends HTMLElement {
  _content!: Utc;

  _bardDiv!: HTMLDivElement;
  _clericDiv!: HTMLDivElement;
  _druidDiv!: HTMLDivElement;
  _paladinDiv!: HTMLDivElement;
  _rangerDiv!: HTMLDivElement;
  _sorcererDiv!: HTMLDivElement;
  _wizardDiv!: HTMLDivElement;

  _bardFieldset!: HTMLFieldSetElement;
  _clericFieldset!: HTMLFieldSetElement;
  _druidFieldset!: HTMLFieldSetElement;
  _paladinFieldset!: HTMLFieldSetElement;
  _rangerFieldset!: HTMLFieldSetElement;
  _sorcererFieldset!: HTMLFieldSetElement;
  _wizardFieldset!: HTMLFieldSetElement;

  _castingClass!: HTMLSelectElement;
  _spell!: HTMLSelectElement;
  _uses!: HTMLInputElement;
  _metaMagic!: HTMLSelectElement;

  _addBtn!: HTMLButtonElement;

  _class0!: HTMLSelectElement;
  _class1!: HTMLSelectElement;
  _class2!: HTMLSelectElement;

  constructor() {
    super();

    this.innerHTML = this._html;

    // DIV elements for hiding/revealing spell lists
    const bardDiv = this.querySelector("#SpellBardDiv");
    if (bardDiv) this._bardDiv = bardDiv as HTMLDivElement;

    const clericDiv = this.querySelector("#SpellClericDiv");
    if (clericDiv) this._clericDiv = clericDiv as HTMLDivElement;

    const druidDiv = this.querySelector("#SpellDruidDiv");
    if (druidDiv) this._druidDiv = druidDiv as HTMLDivElement;

    const paladinDiv = this.querySelector("#SpellPaladinDiv");
    if (paladinDiv) this._paladinDiv = paladinDiv as HTMLDivElement;

    const rangerDiv = this.querySelector("#SpellRangerDiv");
    if (rangerDiv) this._rangerDiv = rangerDiv as HTMLDivElement;

    const sorcererDiv = this.querySelector("#SpellSorcererDiv");
    if (sorcererDiv) this._sorcererDiv = sorcererDiv as HTMLDivElement;

    const wizardDiv = this.querySelector("#SpellWizardDiv");
    if (wizardDiv) this._wizardDiv = wizardDiv as HTMLDivElement;

    // Fieldsets for containing the lists
    const bardFieldset = this.querySelector("#SpellBard");
    if (bardFieldset) this._bardFieldset = bardFieldset as HTMLFieldSetElement;

    const clericFieldset = this.querySelector("#SpellCleric");
    if (clericFieldset) this._clericFieldset = clericFieldset as HTMLFieldSetElement;

    const druidFieldset = this.querySelector("#SpellDruid");
    if (druidFieldset) this._druidFieldset = druidFieldset as HTMLFieldSetElement;

    const paladinFieldset = this.querySelector("#SpellPaladin");
    if (paladinFieldset) this._paladinFieldset = paladinFieldset as HTMLFieldSetElement;

    const rangerFieldset = this.querySelector("#SpellRanger");
    if (rangerFieldset) this._rangerFieldset = rangerFieldset as HTMLFieldSetElement;

    const sorcererFieldset = this.querySelector("#SpellSorcerer");
    if (sorcererFieldset) this._sorcererFieldset = sorcererFieldset as HTMLFieldSetElement;

    const wizardFieldset = this.querySelector("#SpellWizard");
    if (wizardFieldset) this._wizardFieldset = wizardFieldset as HTMLFieldSetElement;

    // Controls for adding new spells
    const castingClass = this.querySelector("#Spells_Add_Class");
    if (castingClass) this._castingClass = castingClass as HTMLSelectElement;

    const spell = this.querySelector("#Spells_Add_Spell");
    if (spell) this._spell = spell as HTMLSelectElement;

    const uses = this.querySelector("#Spells_Add_Uses");
    if (uses) this._uses = uses as HTMLInputElement;

    const metaMagic = this.querySelector("#Spells_Add_Metamagic");
    if (metaMagic) this._metaMagic = metaMagic as HTMLSelectElement;

    const addBtn = this.querySelector("#Spells_Add_Btn");
    if (addBtn) this._addBtn = addBtn as HTMLButtonElement;

    // Class selectors for spells
    const class0 = document.getElementById("res_class0") as HTMLSelectElement;
    if (class0) this._class0 = class0;

    const class1 = document.getElementById("res_class1") as HTMLSelectElement;
    if (class1) this._class1 = class1;

    const class2 = document.getElementById("res_class2") as HTMLSelectElement;
    if (class2) this._class2 = class2;
  }

  public Init(content: Utc) {
    this._content = content;

    this.refreshList();
  }

  private refreshList() {
    this.removeChildren();
    this.hideAll();

    const list = this._content.SpellList.getSpellList();

    for (let i = 0; i < list.length; i++) {
      this.addRow(list[i], i);
    }

    this.showFieldSets();
  }

  private showFieldSets() {
    const class0 = this._class0.value;
    const class1 = this._class1.value;
    const class2 = this._class2.value;

    const class0Div = this.getDiv(parseInt(class0));
    if (class0Div) class0Div.style.display = "flex";

    const class1Div = this.getDiv(parseInt(class1));
    if (class1Div) class1Div.style.display = "flex";

    const class2Div = this.getDiv(parseInt(class2));
    if (class2Div) class2Div.style.display = "flex";
  }

  // Add HTML elements to the list
  private addRow(spell: Spell, index: number) {
    const fieldset = this.getField(spell.class);

    const spellListItem = buildTextField({
      id: "spell_" + this.getClassName(spell.class) + index.toString(),
      value: this.formatSpell(spell),
      disabled: true,
      style: undefined,
      className: undefined,
      maxLength: undefined,
      buttonType: ButtonType.delete,
    });

    spellListItem.setAttribute("spellId", spell.spell.toString());
    spellListItem.setAttribute("casterclass", spell.class.toString());
    spellListItem.setAttribute("metamagic", spell.metamagic.toString());
    spellListItem.setAttribute("uses", spell.uses.toString());

    const delButton = spellListItem.querySelector("vscode-button");
    if (delButton) delButton.addEventListener("click", (e) => this.deleteClickEventHandler(e, index, spellListItem));

    fieldset.appendChild(spellListItem);
  }

  private deleteClickEventHandler(e: Event, index: number, spellListItem: HTMLDivElement) {
    throw new Error("Method not implemented.");
  }

  private getSpellData(spellId: number): any {
    return Spells.find((s) => s.value === spellId);
  }

  private formatSpell(spell: Spell): string {
    const data: SpellData = this.getSpellData(spell.spell);

    let result: string = spell.uses.toString() + " x ";
    result += data.label;
    result += " (" + this.getSpellClassLevel(spell, data).toString() + ")";

    if (spell.metamagic !== Metamagic.None) {
      result += " - " + Metamagic[spell.metamagic];
    }

    return result;
  }

  private getSpellClassLevel(spell: Spell, data: SpellData): number {
    switch (spell.class) {
      case SpellCastingClass.Bard:
        return data.dataBard;
      case SpellCastingClass.Cleric:
        return data.dataCleric;
      case SpellCastingClass.Druid:
        return data.dataDruid;
      case SpellCastingClass.Paladin:
        return data.dataPaladin;
      case SpellCastingClass.Ranger:
        return data.dataRanger;
      case SpellCastingClass.Sorcerer:
        return data.dataWizSorc;
      case SpellCastingClass.Wizard:
        return data.dataWizSorc;
      default:
        throw new Error("Invalid casting class");
    }
  }

  private getDiv(castingClass: SpellCastingClass): HTMLDivElement | undefined {
    switch (castingClass) {
      case SpellCastingClass.Bard:
        return this._bardDiv;
      case SpellCastingClass.Cleric:
        return this._clericDiv;
      case SpellCastingClass.Druid:
        return this._druidDiv;
      case SpellCastingClass.Paladin:
        return this._paladinDiv;
      case SpellCastingClass.Ranger:
        return this._rangerDiv;
      case SpellCastingClass.Sorcerer:
        return this._sorcererDiv;
      case SpellCastingClass.Wizard:
        return this._wizardDiv;
      default:
        return undefined;
    }
  }

  private getField(castingClass: SpellCastingClass): HTMLFieldSetElement {
    switch (castingClass) {
      case SpellCastingClass.Bard:
        return this._bardFieldset;
      case SpellCastingClass.Cleric:
        return this._clericFieldset;
      case SpellCastingClass.Druid:
        return this._druidFieldset;
      case SpellCastingClass.Paladin:
        return this._paladinFieldset;
      case SpellCastingClass.Ranger:
        return this._rangerFieldset;
      case SpellCastingClass.Sorcerer:
        return this._sorcererFieldset;
      case SpellCastingClass.Wizard:
        return this._wizardFieldset;
      default:
        throw new Error("Invalid casting class");
    }
  }

  private getClassName(castingClass: SpellCastingClass): string {
    switch (castingClass) {
      case SpellCastingClass.Bard:
        return "Bard";
      case SpellCastingClass.Cleric:
        return "Cleric";
      case SpellCastingClass.Druid:
        return "Druid";
      case SpellCastingClass.Paladin:
        return "Paladin";
      case SpellCastingClass.Ranger:
        return "Ranger";
      case SpellCastingClass.Sorcerer:
        return "Sorcerer";
      case SpellCastingClass.Wizard:
        return "Wizard";
      default:
        throw new Error("Invalid casting class");
    }
  }

  private removeChildren() {
    this._bardFieldset.replaceChildren();
    this._clericFieldset.replaceChildren();
    this._druidFieldset.replaceChildren();
    this._paladinFieldset.replaceChildren();
    this._rangerFieldset.replaceChildren();
    this._sorcererFieldset.replaceChildren();
    this._wizardFieldset.replaceChildren();
  }

  private hideAll() {
    this._bardDiv.style.display = "none";
    this._clericDiv.style.display = "none";
    this._druidDiv.style.display = "none";
    this._paladinDiv.style.display = "none";
    this._rangerDiv.style.display = "none";
    this._sorcererDiv.style.display = "none";
    this._wizardDiv.style.display = "none";
  }

  private readonly _html: string = `
  <div class="row" id="SpellBardDiv" style="display: none;">
  <div class="col-label">
      <label class="vscode-input-label" for="">Bard:</label>
  </div>
  <div class="col-input">
      <fieldset id="SpellBard" style="width: 325px; display: grid; padding: 5px 5px 5px 5px; border-color: var(--input-placeholder-foreground); border-style: inset;">
      </fieldset>
  </div>
</div>
<div class="row" id="SpellClericDiv" style="display: none;">
  <div class="col-label">
      <label class="vscode-input-label" for="">Cleric:</label>
  </div>
  <div class="col-input">
      <fieldset id="SpellCleric" style="width: 325px; display: grid; padding: 5px 5px 5px 5px; border-color: var(--input-placeholder-foreground); border-style: inset;">
      </fieldset>
  </div>
</div>
<div class="row" id="SpellDruidDiv" style="display: none;">
  <div class="col-label">
      <label class="vscode-input-label" for="">Druid:</label>
  </div>
  <div class="col-input">
      <fieldset id="SpellDruid" style="width: 325px; display: grid; padding: 5px 5px 5px 5px; border-color: var(--input-placeholder-foreground); border-style: inset;">
      </fieldset>
  </div>
</div>
<div class="row" id="SpellPaladinDiv" style="display: none;">
  <div class="col-label">
      <label class="vscode-input-label" for="">Paladin:</label>
  </div>
  <div class="col-input">
      <fieldset id="SpellPaladin" style="width: 325px; display: grid; padding: 5px 5px 5px 5px; border-color: var(--input-placeholder-foreground); border-style: inset;">
      </fieldset>
  </div>
</div>
<div class="row" id="SpellRangerDiv" style="display: none;">
  <div class="col-label">
      <label class="vscode-input-label" for="">Ranger:</label>
  </div>
  <div class="col-input">
      <fieldset id="SpellRanger" style="width: 325px; display: grid; padding: 5px 5px 5px 5px; border-color: var(--input-placeholder-foreground); border-style: inset;">
      </fieldset>
  </div>
</div>
<div class="row" id="SpellSorcererDiv" style="display: none;">
  <div class="col-label">
      <label class="vscode-input-label" for="">Sorcerer:</label>
  </div>
  <div class="col-input">
      <fieldset id="SpellSorcerer" style="width: 325px; display: grid; padding: 5px 5px 5px 5px; border-color: var(--input-placeholder-foreground); border-style: inset;">
      </fieldset>
  </div>
</div>
<div class="row" id="SpellWizardDiv" style="display: none;">
  <div class="col-label">
      <label class="vscode-input-label" for="">Wizard:</label>
  </div>
  <div class="col-input">
      <fieldset id="SpellWizard" style="width: 325px; display: grid; padding: 5px 5px 5px 5px; border-color: var(--input-placeholder-foreground); border-style: inset;">
      </fieldset>
  </div>
</div>
<div class="row">
  <div class="col-label">
      <label class="vscode-input-label" for="">Add Spell:</label>
  </div>
  <div class="col-input">
      <nwn-row label="Casting Class">
          <nwn-drop-down id="Spells_Add_Class" listRef="CastingClass"></nwn-drop-down>
      </nwn-row>
      <nwn-row label="Spell">
          <nwn-drop-down-large id="Spells_Add_Spell" listRef="Spells"></nwn-drop-down-large>
      </nwn-row>
      <div class="row">
        <nwn-number-field id="Spells_Add_Uses" label="Uses" unit="byte"></nwn-number-field>
      </div>
      <nwn-row label="Metamagic">
          <nwn-drop-down id="Spells_Add_Metamagic" listRef="Metamagic"></nwn-drop-down-large>
      </nwn-row>
      <div class="row">
          <vscode-button id="Spells_Add_Btn">Add</vscode-button>
      </div>
  </div>
</div>
  `;
}
