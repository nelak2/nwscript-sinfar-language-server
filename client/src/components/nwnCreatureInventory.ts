import { Utc } from "../editorProviders/resData";
import { buildTextField, ButtonType } from "./utils";

export class nwnCreatureInventory extends HTMLElement {
  _content!: Utc;
  _inventoryDiv!: HTMLFieldSetElement;

  _addResref!: HTMLInputElement;
  _addDropable!: HTMLInputElement;
  _addPickpocketable!: HTMLInputElement;

  constructor() {
    super();

    this.innerHTML = this._html;

    const fieldset = this.querySelector("#CREInventory");
    if (fieldset) this._inventoryDiv = fieldset as HTMLFieldSetElement;

    const addResref = this.querySelector("#CREInventory_Add_Resref");
    if (addResref) this._addResref = addResref as HTMLInputElement;

    const addDropable = this.querySelector("#CREInventory_Add_Dropable");
    if (addDropable) this._addDropable = addDropable as HTMLInputElement;

    const addPickpocketable = this.querySelector("#CREInventory_Add_Pickpocketable");
    if (addPickpocketable) this._addPickpocketable = addPickpocketable as HTMLInputElement;

    // Add event handlers
    const addBtn = this.querySelector("vscode-button");
    if (addBtn !== null) {
      addBtn.addEventListener("click", (e) => this.addClickEventHandler(e));
    }
  }

  public Init(content: Utc) {
    this._content = content;

    this.refreshList();
  }

  public Update(index: number, newValue: any, oldValue: any) {
    // If newValue is undefined then the item was deleted
    if (newValue === undefined && index >= 0) {
      this._content.InventoryList.deleteItem(index);
    }

    // If oldValue is undefined then the item was added
    if (oldValue === undefined) {
      this._content.InventoryList.addItem(newValue.resref, newValue.dropable, newValue.pickpocketable);
    }

    this.refreshList();
  }

  private refreshList() {
    // Clear the list
    this._inventoryDiv.replaceChildren();
    const items = this._content.InventoryList.getItemList();

    // Add each item to the list
    for (let i = 0; i < items.length; i++) {
      this.addRow(items[i], i);
    }
  }

  // Add HTML elements to the list
  private addRow(item: string, index: number) {
    const inventoryListItem = buildTextField({
      id: "cinv_item_" + index.toString(),
      value: item,
      disabled: true,
      style: undefined,
      className: undefined,
      maxLength: 16,
      buttonType: ButtonType.GotoAndDelete,
    });

    const btns = inventoryListItem.querySelectorAll("vscode-button");
    const gotoButton = btns[0];
    const delButton = btns[1];
    if (gotoButton) gotoButton.addEventListener("click", (e) => this.gotoClickEventHandler(e, index));
    if (delButton) delButton.addEventListener("click", (e) => this.deleteClickEventHandler(e, index));

    this._inventoryDiv.appendChild(inventoryListItem);
  }

  // Add the item to the list then refresh the list
  private addClickEventHandler(e: Event) {
    const resref = this._addResref.getAttribute("current-value");
    if (!resref) return;

    const dropable = this._addDropable.checked;
    const pickpocketable = this._addPickpocketable.checked;

    const newValue = { resref, dropable, pickpocketable };

    const success = this._content.InventoryList.addItem(resref, dropable, pickpocketable);

    this.refreshList();

    if (success) {
      this.dispatchEvent(new CustomEvent("CREInventory_change", { detail: { field: this.id, undefined, newValue } }));
    }
  }

  // Delete the item from the list then refresh the list
  private deleteClickEventHandler(e: Event, index: number) {
    const oldValue = this._content.InventoryList.deleteItem(index);
    this.refreshList();

    if (oldValue) {
      this.dispatchEvent(
        new CustomEvent("CREInventory_change", {
          detail: { field: "CREInventory_item_" + index.toString(), oldValue, newValue: undefined },
        }),
      );
    }
  }

  private gotoClickEventHandler(e: Event, index: number) {
    throw new Error("Method not implemented.");
  }

  private readonly _html: string = `
  <div class="row">
  <div class="col-label">
      <label class="vscode-input-label" for="">Inventory Items:</label>
  </div>
  <div class="col-input">
      <fieldset id="CREInventory" style="width: 325px; display: grid; padding: 5px 5px 5px 5px; border-color: var(--input-placeholder-foreground); border-style: inset;">

      </fieldset>
  </div>
</div>

<div class="row">
  <div class="col-label">
      <label class="vscode-input-label" for="">Add Item:</label>
  </div>
  <div class="col-input">
      <div class="row">
        <vscode-checkbox id="CREInventory_Add_Dropable">Dropable</vscode-checkbox>
        <vscode-checkbox id="CREInventory_Add_Pickpocketable">Pickpocketable</vscode-checkbox>
      </div>
      <div class="row">
        <vscode-text-field id="CREInventory_Add_Resref" maxlength="16" placeholder="ResRef" type="text" style="width: 200px;">
        </vscode-text-field>
      </div>
      <div class="row">
        <vscode-button id="CREInventory_Add_btn">Add</vscode-button>
      </div>
      
  </div>
</div>
  `;
}
