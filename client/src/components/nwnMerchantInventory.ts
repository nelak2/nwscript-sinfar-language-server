import { Utm } from "../editorProviders/resData";
import { InventoryItem } from "../editorProviders/resData/utm";
import { MerchantInventoryCategory } from "./lists";
import { buildTextField, buildLabelColumn, buildDiv, ButtonType } from "./utils";

export class nwnMerchantInventory extends HTMLElement {
  _content!: Utm;
  _listDiv: HTMLFieldSetElement[] = [];

  _addCategory!: HTMLElement;
  _addResref!: HTMLElement;
  _addInfinite!: HTMLElement;

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

  public Update(category: number, index: number, newValue: InventoryItem, oldValue: InventoryItem) {
    if (category === undefined || index === undefined) return;

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
    const infinite = item.Infinite ? " (Infinite)" : "";

    const inventoryListItem = buildTextField({
      id: "rst_item" + listIndex.toString() + "_" + index.toString(),
      value: item.Resref + infinite,
      disabled: true,
      style: undefined,
      className: undefined,
      maxLength: 16,
      buttonType: ButtonType.GotoAndDelete,
    });

    const btns = inventoryListItem.querySelectorAll("vscode-button");
    const gotoButton = btns[0];
    if (gotoButton) gotoButton.addEventListener("click", (e) => this.gotoClickEventHandler(e, index));
    const delButton = btns[1];
    if (delButton) delButton.addEventListener("click", (e) => this.deleteClickEventHandler(e, index, item.Category));

    this._listDiv[listIndex].appendChild(inventoryListItem);
  }

  // Add the item to the list then refresh the list
  private addClickEventHandler(e: Event) {
    const resref = (this._addResref as HTMLInputElement).getAttribute("current-value");
    const infinite = (this._addInfinite as HTMLInputElement).checked;
    const category = parseInt((this._addCategory as HTMLSelectElement).getAttribute("current-value") || "");

    if (resref === null || resref === "") return;

    const newValue: InventoryItem = { Resref: resref, Infinite: infinite, Category: category };

    const oldValue = this._content.InventoryList.addItem(newValue, category);

    // clear the fields
    (this._addResref as HTMLInputElement).value = "";

    this.refreshList();

    const index = this._content.InventoryList.getItemList(newValue.Category).length - 1;

    if (
      oldValue?.Category === newValue.Category &&
      oldValue?.Resref === newValue.Resref &&
      oldValue?.Infinite === newValue.Infinite
    ) {
      this.dispatchEvent(
        new CustomEvent("MerchantInventory_change", {
          detail: {
            field: "MerchantInventory_item_" + newValue.Category.toString() + "_" + index.toString(),
            undefined,
            newValue,
          },
        }),
      );
    }
  }

  // Delete the item from the list then refresh the list
  private deleteClickEventHandler(e: Event, index: number, category: number) {
    const oldValue = this._content.InventoryList.deleteItem(index, category);
    this.refreshList();

    if (oldValue) {
      this.dispatchEvent(
        new CustomEvent("MerchantInventory_change", {
          detail: {
            field: "MerchantInventory_item_" + category.toString() + "_" + index.toString(),
            oldValue,
            newValue: undefined,
          },
        }),
      );
    }
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
    fieldset.id = "MerchantInventory";
    fieldset.style.width = "320px";
    fieldset.style.display = "grid";
    fieldset.style.padding = "5px 5px 5px 5px";
    fieldset.style.borderColor = "var(--input-placeholder-foreground)";
    fieldset.style.borderStyle = "inset";

    const inputCol = buildDiv("col-input");
    inputCol.appendChild(fieldset);

    // Store reference to the fieldset so we can add/remove children
    this._listDiv[this.getListIndex(category)] = fieldset;
    // this._listDiv[this.getListIndex(category)].push(fieldset);
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

    this._addCategory = AddRow.querySelector("vscode-dropdown") as HTMLElement;
    this._addResref = AddRow.querySelector("vscode-text-field") as HTMLElement;
    this._addInfinite = AddRow.querySelector("vscode-checkbox") as HTMLElement;

    this._addCategory.style.maxWidth = "200px";
    this._addResref.style.maxWidth = "200px";

    const addButton = AddRow.querySelectorAll("vscode-button");
    addButton[1].addEventListener("click", (e) => this.addClickEventHandler(e));

    return AddRow;
  }

  private readonly _addRowHtml: string = `
  <div class="row">
  <div class="col-label">
      <label class="vscode-input-label" for="">Add Inventory Item:</label>
  </div>
  <div class="col-input">
      <nwn-text-field id="InventoryAddResref" label="ResRef" type="resref" style="max-width: 200px;">
      </nwn-text-field>
      <nwn-drop-down id="InventoryAddCategory" label="Category" listRef="MerchantInventoryCategory" style="max-width: 200px;"></nwn-drop-down>
      <nwn-row label="Flags">
          <vscode-checkbox id="InventoryAddInfinite" role="checkbox" aria-checked="false" aria-required="false"
          aria-disabled="false" tabindex="0" aria-label="Infinite" current-value="on"
          current-checked="false">Infinite</vscode-checkbox>
      </nwn-row>
      <nwn-row label=" ">
          <vscode-button id="MerchantInventoryAddButton">Add</vscode-button>
      </nwn-row>
  </div>
</div>
  `;
}
