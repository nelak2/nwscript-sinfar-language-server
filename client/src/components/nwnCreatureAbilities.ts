import { Utc } from "../editorProviders/resData";
import { Ability } from "../editorProviders/resData/utc";
import { buildTextField, ButtonType } from "./utils";
import { Abilities } from "./lists";

export class nwnCreatureAbilities extends HTMLElement {
  _content!: Utc;
  _listDiv!: HTMLFieldSetElement;

  _addAbility!: HTMLSelectElement;
  _addCasterLevel!: HTMLInputElement;
  _addUses!: HTMLInputElement;

  constructor() {
    super();

    this.innerHTML = this._html;

    const fieldset = this.querySelector("#CRAbilities");
    if (fieldset) this._listDiv = fieldset as HTMLFieldSetElement;

    const addAbility = this.querySelector("#CRAbilities_Add_Ability");
    if (addAbility) this._addAbility = addAbility as HTMLSelectElement;

    const addCasterLevel = this.querySelector("#CRAbilities_Add_CasterLevel");
    if (addCasterLevel) this._addCasterLevel = addCasterLevel as HTMLInputElement;

    const addUses = this.querySelector("#CRAbilities_Add_Uses");
    if (addUses) this._addUses = addUses as HTMLInputElement;

    // Add event handlers
    const addBtn = this.querySelector("vscode-button");
    if (addBtn !== null) {
      addBtn.addEventListener("click", (e) => this.addClickEventHandler(e));
    }
  }

  public Update(index: number, newValue: Ability, oldValue: Ability) {
    // If newValue is undefined then the item was deleted
    if (newValue === undefined && index >= 0) {
      this._content.AbilityList.deleteAbilityBySpellID(oldValue.spell);
    }

    // If oldValue is undefined then the item was added
    if (oldValue === undefined) {
      this._content.AbilityList.addAbility(newValue);
    }

    this.refreshList();
  }

  public Init(content: Utc) {
    this._content = content;

    this.refreshList();
  }

  private refreshList() {
    // Clear the list
    this._listDiv.replaceChildren();
    const items = this._content.AbilityList.getAbilityList();

    // Add each item to the list
    for (let i = 0; i < items.length; i++) {
      this.addRow(items[i], i);
    }
  }

  // Add HTML elements to the list
  private addRow(item: Ability, index: number) {
    const abilityListItem = buildTextField({
      id: "cra_item_" + index.toString(),
      value: this.formatAbility(item),
      disabled: true,
      style: undefined,
      className: undefined,
      maxLength: undefined,
      buttonType: ButtonType.delete,
    });

    abilityListItem.setAttribute("spellId", item.spell.toString());

    const delButton = abilityListItem.querySelector("vscode-button");
    if (delButton) delButton.addEventListener("click", (e) => this.deleteClickEventHandler(e, index, abilityListItem));

    this._listDiv.appendChild(abilityListItem);
  }

  private formatAbility(item: Ability): string {
    let result: string = item.uses.toString() + " x " + this.getAbilityName(item.spell);
    if (item.spellcasterlevel > 0) result += " - Level " + item.spellcasterlevel.toString();

    return result;
  }

  private getAbilityName(spell: number): string {
    const ability = Abilities.find((a) => a.value === spell.toString());
    if (ability) return ability.label;
    return "Unknown";
  }

  // Delete the item from the list then refresh the list
  private deleteClickEventHandler(e: Event, index: number, item: HTMLElement) {
    const spellID = item.getAttribute("spellId");
    if (!spellID) return;

    const oldValue = this._content.AbilityList.deleteAbilityBySpellID(parseInt(spellID));
    if (oldValue) {
      this.refreshList();

      this.dispatchEvent(
        new CustomEvent("CRAbilities_change", {
          detail: { field: "CRAbilities_item_" + index.toString(), oldValue, newValue: undefined },
        }),
      );
    }
  }

  // Add the item to the list then refresh the list
  private addClickEventHandler(e: Event) {
    const ability = this._addAbility.value;
    const casterLevel = this._addCasterLevel.value;
    const uses = this._addUses.value;

    const newValue = { spell: parseInt(ability), spellcasterlevel: parseInt(casterLevel), uses: parseInt(uses), spellflags: 1 };

    const success = this._content.AbilityList.addAbility(newValue);

    if (success) {
      this.refreshList();

      this.dispatchEvent(new CustomEvent("CRAbilities_change", { detail: { field: this.id, undefined, newValue } }));
    }
  }

  private readonly _html: string = `
  <div class="row">
  <div class="col-label">
      <label class="vscode-input-label" for="">Special Abilities:</label>
  </div>
  <div class="col-input">
      <fieldset id="CRAbilities" style="width: 325px; display: grid; padding: 5px 5px 5px 5px; border-color: var(--input-placeholder-foreground); border-style: inset;">
      </fieldset>
  </div>
</div>
<div class="row">
  <div class="col-label">
      <label class="vscode-input-label" for="">Add Special Ability:</label>
  </div>
  <div class="col-input">
      <nwn-row label="Ability">
          <nwn-drop-down-large id="CRAbilities_Add_Ability" listRef="Abilities"></nwn-drop-down-large>
      </nwn-row>
      <div class="row">
          <nwn-number-field id="CRAbilities_Add_CasterLevel" label="Caster Level" unit="byte"></nwn-number-field>
      </div>
      <div class="row">
          <nwn-number-field id="CRAbilities_Add_Uses" label="Uses" unit="byte"></nwn-number-field>
      </div>
      <div class="row">
        <vscode-button id="CRAbilities_Add_btn">Add</vscode-button>
      </div>
  </div>
</div>
  `;
}
