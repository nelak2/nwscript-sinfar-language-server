import { Utc } from "../editorProviders/resData";
import { buildTextField, buildLabelColumn, buildDiv, ButtonType } from "./utils";

export class nwnCreatureInventory extends HTMLElement {
  _content!: Utc;
  _inventoryDiv!: HTMLFieldSetElement;
  constructor() {
    super();

    const inventoryListRow = this.buildInventoryListRow();
    const inventoryAddRow = this.buildInventoryAddRow();

    this.appendChild(inventoryListRow);
    this.appendChild(inventoryAddRow);
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
      this._content.InventoryList.addItem(newValue);
    }

    // If neither newValue or oldValue are undefined then the item was updated
    if (newValue !== undefined && oldValue !== undefined) {
      this._content.InventoryList.updateItem(index, newValue);
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
  private addClickEventHandler(e: Event, newValue: string) {
    const oldValue = this._content.InventoryList.addItem(newValue);

    // clear the text field
    const textField = document.getElementById("CREInventoryAdd") as HTMLInputElement;
    if (textField) textField.value = "";

    this.refreshList();

    if (oldValue === newValue) {
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

  private changeEventHandler(e: Event, index: number) {
    const newValue = (e.target as HTMLInputElement).value;
    const oldValue = this._content.InventoryList.updateItem(index, newValue);

    this.dispatchEvent(
      new CustomEvent("CREInventory_change", {
        detail: { field: "CREInventory_item_" + index.toString(), oldValue, newValue },
      }),
    );
  }

  private gotoClickEventHandler(e: Event, index: number) {
    throw new Error("Method not implemented.");
  }

  private buildInventoryList(): HTMLDivElement {
    const fieldset = document.createElement("fieldset");
    fieldset.id = "CREInventory";
    fieldset.style.width = "190px";
    fieldset.style.display = "grid";
    fieldset.style.padding = "5px 5px 5px 5px";
    fieldset.style.borderColor = "var(--input-placeholder-foreground)";
    fieldset.style.borderStyle = "inset";

    const inputCol = buildDiv("col-input");
    inputCol.appendChild(fieldset);

    // Store reference to the fieldset so we can add/remove children
    this._inventoryDiv = fieldset;
    return inputCol;
  }

  private buildInventoryListRow(): HTMLDivElement {
    const listLabelCol = buildLabelColumn("Inventory Items", "CREInventory");
    const listInputCol = this.buildInventoryList();

    const listRow = buildDiv("row");
    listRow.appendChild(listLabelCol);
    listRow.appendChild(listInputCol);
    return listRow;
  }

  private buildInventoryAddRow(): HTMLDivElement {
    const inventoryAddLabelCol = buildLabelColumn("Add Item", "CREInventoryAdd_txt");
    const inventoryAddInputCol = buildTextField({
      id: "CREInventoryItemAdd",
      value: undefined,
      disabled: false,
      style: undefined,
      className: undefined,
      maxLength: 16,
      buttonType: ButtonType.add,
    });

    // Add event handlers
    const addBtn = inventoryAddInputCol.querySelector("vscode-button");
    if (addBtn !== null) {
      addBtn.addEventListener("click", (e) => this.addClickEventHandler(e, (inventoryAddInputCol as HTMLInputElement).value));
    }
    inventoryAddInputCol.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.addClickEventHandler(e, (inventoryAddInputCol as HTMLInputElement).value);
      }
    });

    const soundAddRow = buildDiv("row");
    soundAddRow.appendChild(inventoryAddLabelCol);
    soundAddRow.appendChild(inventoryAddInputCol);
    return soundAddRow;
  }
}
