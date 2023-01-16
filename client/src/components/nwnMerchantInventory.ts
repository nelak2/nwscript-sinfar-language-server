import { Utm } from "../editorProviders/resData";
import { InventoryItem } from "../editorProviders/resData/utm";
import { BaseItems, MerchantInventoryCategory } from "./lists";
import { buildTextField, buildLabelColumn, buildDiv, ButtonType } from "./utils";

export class nwnMerchantInventory extends HTMLElement {
  _content!: Utm;
  _listDiv!: HTMLFieldSetElement[];
  constructor() {
    super();

    const armorRow = this.buildListRow("Armor Items", "InventoryArmorList");
    const weaponRow = this.buildListRow("Weapons", "InventoryWeaponList");
    const jewelRow = this.buildListRow("Jewelry", "InventoryJewelryList");
    const potionRow = this.buildListRow("Potions", "InventoryPotionList");
    const miscRow = this.buildListRow("Miscellaneous", "InventoryMiscList");

    const addRow = this.buildAddRow();
    // const addBtn = this.buildAddButton();

    this.appendChild(armorRow);
    this.appendChild(weaponRow);
    this.appendChild(jewelRow);
    this.appendChild(potionRow);
    this.appendChild(miscRow);
    this.appendChild(addRow);
    // this.appendChild(addBtn);
  }

  public Init(content: Utm) {
    this._content = content;

    this.refreshList();
  }

  public Update(index: number, newValue: InventoryItem, oldValue: InventoryItem) {
    // If newValue is undefined then the item was deleted
    if (newValue === undefined && index >= 0) {
      this._content.InventoryList.deleteItem(index, oldValue.Category);
    }

    // If oldValue is undefined then the item was added
    if (oldValue === undefined) {
      this._content.InventoryList.addItem(newValue, newValue.Category);
    }

    // If neither newValue or oldValue are undefined then the item was updated
    if (newValue !== undefined && oldValue !== undefined) {
      this._content.InventoryList.updateItem(index, newValue, newValue.Category);
    }

    this.refreshList();
  }

  private refreshList() {
    // Clear the list
    // this._listDiv.replaceChildren();
    for (const div of this._listDiv) {
      div.replaceChildren();
    }

    let listIndex = 0;
    for (const category of MerchantInventoryCategory) {
      const items = this._content.InventoryList.getItemList(parseInt(category.value));
      for (let j = 0; j < items.length; j++) {
        this.addRow(items[j], j, listIndex);
      }
      listIndex++;
    }
  }

  // Add HTML elements to the list
  private addRow(item: InventoryItem, index: number, listIndex: number) {
    const inventoryListItem = buildTextField({
      id: "rst_item" + listIndex.toString() + "_" + index.toString(),
      value: item.Resref,
      disabled: true,
      style: undefined,
      className: undefined,
      maxLength: 16,
      buttonType: ButtonType.delete,
    });

    const btns = inventoryListItem.querySelectorAll("vscode-button");
    const delButton = btns[0];
    if (delButton) delButton.addEventListener("click", (e) => this.deleteClickEventHandler(e, index));

    this._listDiv[listIndex].appendChild(inventoryListItem);
  }

  // Add the item to the list then refresh the list
  private addClickEventHandler(e: Event, newValue: InventoryItem) {
    const oldValue = this._content.InventoryList.addItem(newValue, newValue.Category);

    // if the item already exists then do nothing
    if (!oldValue) return;

    // clear the fields
    const textField = document.getElementById("InventoryAddItem") as HTMLInputElement;
    if (textField) textField.value = "";

    this.refreshList();

    if (oldValue === newValue) {
      this.dispatchEvent(new CustomEvent("InventoryList_change", { detail: { field: this.id, undefined, newValue } }));
    }
  }

  // Delete the item from the list then refresh the list
  private deleteClickEventHandler(e: Event, index: number, category: number) {
    const oldValue = this._content.InventoryList.deleteItem(index, category);
    this.refreshList();

    if (oldValue) {
      this.dispatchEvent(
        new CustomEvent("InventoryList_change", {
          detail: { field: "InventoryList_item_" + index.toString(), oldValue, newValue: undefined },
        }),
      );
    }
  }

  private changeEventHandler(e: Event, index: number) {
    const newValue = (e.target as HTMLInputElement).value;
    const oldValue = this._content.InventoryList.updateItem(index, newValue);

    this.dispatchEvent(
      new CustomEvent("InventoryList_change", {
        detail: { field: "InventoryList_item_" + index.toString(), oldValue, newValue },
      }),
    );
  }

  private gotoClickEventHandler(e: Event, index: number) {
    throw new Error("Method not implemented.");
  }

  private getListIndex(category: string): number {
    switch (category) {
      case "InventoryArmorList":
        return 0;
      case "InventoryWeaponList":
        return 1;
      case "InventoryJewelryList":
        return 2;
      case "InventoryPotionList":
        return 3;
      case "InventoryMiscList":
        return 4;
      default:
        return -1;
    }
  }

  private buildInventoryList(category: string): HTMLDivElement {
    const fieldset = document.createElement("fieldset");
    fieldset.id = "InventoryList";
    fieldset.style.width = "320px";
    fieldset.style.display = "grid";
    fieldset.style.padding = "5px 5px 5px 5px";
    fieldset.style.borderColor = "var(--input-placeholder-foreground)";
    fieldset.style.borderStyle = "inset";

    const inputCol = buildDiv("col-input");
    inputCol.appendChild(fieldset);

    // Store reference to the fieldset so we can add/remove children
    this._listDiv[this.getListIndex(category)].push(fieldset);
    return inputCol;
  }

  private buildListRow(label: string, id: string): HTMLDivElement {
    const listLabelCol = buildLabelColumn(label, id);
    const listInputCol = this.buildInventoryList(id);

    const listRow = buildDiv("row");
    listRow.appendChild(listLabelCol);
    listRow.appendChild(listInputCol);
    return listRow;
  }

  private buildAddRow(): HTMLDivElement {
    const AddRow = document.createElement("div");
    AddRow.innerHTML = this._addRowHtml;
    AddRow.className = "row";

    return AddRow;
  }

  private buildAddButton(): HTMLDivElement {
    const AddButton = document.createElement("div");
    AddButton.className = "row";
    AddButton.innerHTML = this._addButtonHtml;

    const addBtn = AddButton.querySelector("vscode-button") as HTMLButtonElement;
    addBtn.addEventListener("click", (e) =>
      this.addClickEventHandler(e, (document.getElementById("InventoryListAdd") as HTMLInputElement).value),
    );

    return AddButton;
  }

  private readonly _addRowHtml: string = `
  <nwn-row label="Add Inventory Item">
    <nwn-text-field id="InventoryAddResref" label="ResRef" type="resref"></nwn-text-field>
    <nwn-drop-down id="InventoryAddCategory" label="Category" listRef="MerchantInventoryCategory"></nwn-drop-down>
    <nwn-row label="Flags">
      <vscode-checkbox id="InventoryAddInfinite">Infinite</vscode-checkbox>
    </nwn-row>
    <nwn-row label=" ">
      <vscode-button id="InventoryListAddButton">Add</vscode-button>
    </nwn-row>
  </nwn-row>
  `;

  private readonly _addButtonHtml: string = `
  <nwn-row label=" ">
    
  </nwn-row>
    `;
}
