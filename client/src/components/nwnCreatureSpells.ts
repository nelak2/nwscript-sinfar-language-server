import { Utc } from "../editorProviders/resData";
import { Metamagic, Spell, SpellCastingClass } from "../editorProviders/resData/utc";
import { Spells } from "./lists";
import { SpellData } from "./lists/spells";
import { nwnDropDownLarge } from "./nwnDropDownLarge";
import { buildTextField, ButtonType } from "./utils";

export class nwnCreatureSpells extends HTMLElement {
  _content!: Utc;

  _DivElements: { classId: SpellCastingClass; div: HTMLDivElement }[] = [];
  _FieldsetElements: { classId: SpellCastingClass; fieldset: HTMLFieldSetElement }[] = [];

  _castingClass!: HTMLSelectElement;
  _spell!: nwnDropDownLarge;
  _uses!: HTMLInputElement;
  _metaMagic!: HTMLSelectElement;

  _addBtn!: HTMLButtonElement;

  _class0!: HTMLSelectElement;
  _class1!: HTMLSelectElement;
  _class2!: HTMLSelectElement;

  _initialized = false;

  constructor() {
    super();

    this.innerHTML = this._html;

    for (const pcClass in SpellCastingClass) {
      // DIV elements for hiding/revealing spell lists
      const currentClass = this.getSpellCastingClass(pcClass);
      const div = this.querySelector(`#Spell${pcClass}Div`) as HTMLDivElement;
      if (div) this._DivElements.push({ classId: currentClass, div });

      // Fieldsets for containing the lists
      const fieldset = this.querySelector(`#Spell${pcClass}`) as HTMLFieldSetElement;
      if (fieldset) this._FieldsetElements.push({ classId: currentClass, fieldset });
    }

    // Controls for adding new spells
    const castingClass = this.querySelector("#Spells_Add_Class");
    if (castingClass) {
      this._castingClass = castingClass as HTMLSelectElement;
      this._castingClass.addEventListener("click", () => this.castingClassClickHandler());
      this._castingClass.addEventListener("change", (e) => this.castingClassChangeHandler(e), true);
    }

    const spell = this.querySelector("#Spells_Add_Spell");
    if (spell) this._spell = spell as nwnDropDownLarge;

    const uses = this.querySelector("#Spells_Add_Uses");
    if (uses) this._uses = uses as HTMLInputElement;

    const metaMagic = this.querySelector("#Spells_Add_Metamagic");
    if (metaMagic) this._metaMagic = metaMagic as HTMLSelectElement;

    const addBtn = this.querySelector("#Spells_Add_Btn");
    if (addBtn) {
      this._addBtn = addBtn as HTMLButtonElement;
      this._addBtn.addEventListener("click", () => this.addClickEventHandler());
    }

    // Class selectors for spells
    const class0 = document.getElementById("res_class0") as HTMLSelectElement;
    if (class0) this._class0 = class0;

    const class1 = document.getElementById("res_class1") as HTMLSelectElement;
    if (class1) this._class1 = class1;

    const class2 = document.getElementById("res_class2") as HTMLSelectElement;
    if (class2) this._class2 = class2;
  }

  private classFieldChangeHandler(e: Event) {
    // Ensure the level field is updated
    const target = e.target as HTMLSelectElement;
    if (target.value !== "-1") {
      const id = target.id.substring(9);
      const levelField = document.getElementById(`res_classlevel${id}`) as HTMLInputElement;
      const level = parseInt(levelField.value);
      this._content.setField(`class${id}`, target.value);
      this._content.setField(`classlevel${id}`, level.toString());
    }

    this.refreshList();
  }

  private castingClassChangeHandler(e: Event) {
    const target = e.target;

    const value = (target as HTMLSelectElement).value;

    if (value === "-1") {
      this._spell.replaceChildren();
      return;
    }

    const spellCastingClass = this.getSpellCastingClass(value);

    const spells = Spells.filter((s) => this.getSpellClassLevel(spellCastingClass, s) > -1);

    void this._spell.setList(spells);
  }

  private castingClassClickHandler() {
    const classes: SpellCastingClass[] = [];
    classes.push(this.getSpellCastingClass(this._class0.value));
    classes.push(this.getSpellCastingClass(this._class1.value));
    classes.push(this.getSpellCastingClass(this._class2.value));

    this.filterCastingClass(classes);
  }

  private getSpellCastingClass(classId: string): SpellCastingClass {
    switch (classId) {
      case "1":
      case "Bard":
        return SpellCastingClass.Bard;
      case "Cleric":
      case "2":
        return SpellCastingClass.Cleric;
      case "Druid":
      case "3":
        return SpellCastingClass.Druid;
      case "Paladin":
      case "6":
        return SpellCastingClass.Paladin;
      case "Ranger":
      case "7":
        return SpellCastingClass.Ranger;
      case "Sorcerer":
      case "9":
        return SpellCastingClass.Sorcerer;
      case "Wizard":
      case "10":
        return SpellCastingClass.Wizard;
      default:
        return -1;
    }
  }

  private filterCastingClass(classes: SpellCastingClass[]) {
    this._castingClass.replaceChildren();

    const option = document.createElement("option");
    option.value = "-1";
    option.text = "Select a class";
    this._castingClass.appendChild(option);

    for (let i = 0; i < classes.length; i++) {
      if (classes[i] === -1) continue;

      const option = document.createElement("option");
      option.value = classes[i].toString();
      option.text = this.getClassName(classes[i]);
      this._castingClass.appendChild(option);
    }
  }

  public Init(content: Utc) {
    if (!this._initialized) {
      this._initialized = true;

      // bind listeners to watch for class changes
      this._class0.addEventListener("change", (e) => this.classFieldChangeHandler(e), true);
      this._class1.addEventListener("change", (e) => this.classFieldChangeHandler(e), true);
      this._class2.addEventListener("change", (e) => this.classFieldChangeHandler(e), true);
    }
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

    const class0Div = this._DivElements.find((x) => x.classId === this.getSpellCastingClass(class0))?.div;
    if (class0Div) class0Div.style.display = "flex";

    const class1Div = this._DivElements.find((x) => x.classId === this.getSpellCastingClass(class1))?.div;
    if (class1Div) class1Div.style.display = "flex";

    const class2Div = this._DivElements.find((x) => x.classId === this.getSpellCastingClass(class2))?.div;
    if (class2Div) class2Div.style.display = "flex";
  }

  // Add HTML elements to the list
  private addRow(spell: Spell, index: number) {
    const fieldset = this._FieldsetElements.find((x) => x.classId === spell.class)?.fieldset;
    if (!fieldset) return;

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
    spellListItem.setAttribute("level", spell.level.toString());

    const delButton = spellListItem.querySelector("vscode-button");
    if (delButton) delButton.addEventListener("click", (e) => this.deleteClickEventHandler(e, index, spellListItem));

    fieldset.appendChild(spellListItem);
  }

  private deleteClickEventHandler(e: Event, index: number, spellListItem: Element) {
    const spell: Spell = {
      spell: parseInt(spellListItem.getAttribute("spellId") as string),
      class: parseInt(spellListItem.getAttribute("casterclass") as string),
      metamagic: parseInt(spellListItem.getAttribute("metamagic") as string),
      uses: parseInt(spellListItem.getAttribute("uses") as string),
      level: parseInt(spellListItem.getAttribute("level") as string),
    };

    const result = this._content.SpellList.removeSpell(spell);

    if (result) {
      this.refreshList();

      this.dispatchEvent(
        new CustomEvent("spellListChanged", {
          detail: {
            field: "spell_" + this.getClassName(spell.class) + index.toString(),
            oldValue: spell,
            newValue: undefined,
          },
        }),
      );
    }
  }

  private addClickEventHandler() {
    const spellId = parseInt(this._spell.value);
    const classId = parseInt(this._castingClass.value);
    const metamagicId = parseInt(this._metaMagic.value);
    const uses = parseInt(this._uses.value);
    const level = this._content.SpellList.getSpellLevel(spellId, classId, metamagicId);

    const spell: Spell = {
      spell: spellId,
      class: classId,
      metamagic: metamagicId,
      uses,
      level,
    };

    // No class selected
    if (classId === 0) return;

    // No uses
    if (uses < 0) return;

    // No spell selected
    if (spellId < 0) return;

    if (level === -1) {
      throw new Error("The selected spell is not available for the selected class.");
    }

    if (level > 9) {
      throw new Error("The metamagic + innate spell level is not valid.");
    }

    const result = this._content.SpellList.addSpell(spell);

    if (result) {
      this.refreshList();

      this.dispatchEvent(
        new CustomEvent("spellListChanged", {
          detail: {
            field: "spell_" + this.getClassName(spell.class) + this._content.SpellList.getSpellList().length.toString(),
            oldValue: undefined,
            newValue: spell,
          },
        }),
      );

      this._castingClass.value = "0";
      this._spell.value = "-1";
      this._metaMagic.value = "0";
      this._uses.value = "0";
    }
  }

  private getSpellData(spellId: number): any {
    return Spells.find((s) => s.value === spellId);
  }

  private formatSpell(spell: Spell): string {
    const data: SpellData = this.getSpellData(spell.spell);

    let result: string = spell.uses.toString() + " x ";
    result += data.label;
    result += " (" + this.getSpellClassLevel(spell.class, data).toString() + ")";

    if (spell.metamagic !== Metamagic.None) {
      result += " - " + Metamagic[spell.metamagic];
    }

    return result;
  }

  private getSpellClassLevel(classId: number, data: SpellData): number {
    switch (classId) {
      case SpellCastingClass.Bard:
        return data.Bard;
      case SpellCastingClass.Cleric:
        return data.Cleric;
      case SpellCastingClass.Druid:
        return data.Druid;
      case SpellCastingClass.Paladin:
        return data.Paladin;
      case SpellCastingClass.Ranger:
        return data.Ranger;
      case SpellCastingClass.Sorcerer:
      case SpellCastingClass.Wizard:
        return data.WizSorc;
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
    for (const child of this._FieldsetElements) {
      child.fieldset.replaceChildren();
    }
  }

  private hideAll() {
    for (const child of this._DivElements) {
      child.div.style.display = "none";
    }
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
