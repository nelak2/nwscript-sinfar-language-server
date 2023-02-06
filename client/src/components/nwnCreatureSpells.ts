import { Utc } from "../editorProviders/resData";

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

    const metaMagic = this.querySelector("#Spells_Add_MetaMagic");
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

  private readonly _html: string = `
  <div class="row" id="SpellBardDiv">
    <div class="col-label">
        <label class="vscode-input-label" for="">Bard:</label>
    </div>
    <div class="col-input">
        <fieldset id="SpellBard" style="width: 325px; display: grid; padding: 5px 5px 5px 5px; border-color: var(--input-placeholder-foreground); border-style: inset;">
        </fieldset>
    </div>
</div>
<div class="row" id="SpellClericDiv">
    <div class="col-label">
        <label class="vscode-input-label" for="">Cleric:</label>
    </div>
    <div class="col-input">
        <fieldset id="SpellCleric" style="width: 325px; display: grid; padding: 5px 5px 5px 5px; border-color: var(--input-placeholder-foreground); border-style: inset;">
        </fieldset>
    </div>
</div>
<div class="row" id="SpellDruidDiv">
    <div class="col-label">
        <label class="vscode-input-label" for="">Druid:</label>
    </div>
    <div class="col-input">
        <fieldset id="SpellDruid" style="width: 325px; display: grid; padding: 5px 5px 5px 5px; border-color: var(--input-placeholder-foreground); border-style: inset;">
        </fieldset>
    </div>
</div>
<div class="row" id="SpellPaladinDiv">
    <div class="col-label">
        <label class="vscode-input-label" for="">Paladin:</label>
    </div>
    <div class="col-input">
        <fieldset id="SpellPaladin" style="width: 325px; display: grid; padding: 5px 5px 5px 5px; border-color: var(--input-placeholder-foreground); border-style: inset;">
        </fieldset>
    </div>
</div>
<div class="row" id="SpellRangerDiv">
    <div class="col-label">
        <label class="vscode-input-label" for="">Ranger:</label>
    </div>
    <div class="col-input">
        <fieldset id="SpellRanger" style="width: 325px; display: grid; padding: 5px 5px 5px 5px; border-color: var(--input-placeholder-foreground); border-style: inset;">
        </fieldset>
    </div>
</div>
<div class="row" id="SpellSorcererDiv">
    <div class="col-label">
        <label class="vscode-input-label" for="">Sorcerer:</label>
    </div>
    <div class="col-input">
        <fieldset id="SpellSorcerer" style="width: 325px; display: grid; padding: 5px 5px 5px 5px; border-color: var(--input-placeholder-foreground); border-style: inset;">
        </fieldset>
    </div>
</div>
<div class="row" id="SpellWizardDiv">
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
            <nwn-drop-down id="Spells_Add_Spell" listRef="Spell"></nwn-drop-down-large>
        </nwn-row>
        <div class="row">
          <nwn-number-field id="Spells_Add_Uses" label="Uses" unit="byte"></nwn-number-field>
        </div>
        <nwn-row label="Metamagic">
            <nwn-drop-down id="Spells_Add_Metamagic" listRef="Metamagic"></nwn-drop-down-large>
        </nwn-row>
        <div class="row">
            <vscode-button id="Spells_Add_btn">Add</vscode-button>
        </div>
    </div>
</div>
  `;
}
