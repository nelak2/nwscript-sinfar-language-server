import { Utm } from "../editorProviders/resData";
import { BaseItems } from "./lists";
import { buildTextField, buildLabelColumn, buildDiv, ButtonType } from "./utils";

export class nwnMerchantRestrictions extends HTMLElement {
  _content!: Utm;
  _listDiv!: HTMLFieldSetElement;
  constructor() {
    super();

    const listRow = this.buildListRow();
    const addRow = this.buildAddRow();
    const addBtn = this.buildAddButton();

    this.appendChild(listRow);
    this.appendChild(addRow);
    this.appendChild(addBtn);
  }

  public Init(content: Utm) {
    this._content = content;

    this.refreshList();
  }

  public Update(index: number, newValue: string, oldValue: string) {
    // If newValue is undefined then the item was deleted
    if (newValue === undefined && index >= 0) {
      this._content.RestrictionList.deleteItem(index);
    }

    // If oldValue is undefined then the item was added
    if (oldValue === undefined) {
      this._content.RestrictionList.addItem(newValue);
    }

    // If neither newValue or oldValue are undefined then the item was updated
    if (newValue !== undefined && oldValue !== undefined) {
      this._content.RestrictionList.updateItem(index, newValue);
    }

    this.refreshList();
  }

  private refreshList() {
    // Clear the list
    this._listDiv.replaceChildren();
    const items = this._content.RestrictionList.getItemList();

    // Add each item to the list
    for (let i = 0; i < items.length; i++) {
      this.addRow(items[i], i);
    }
  }

  private formatItem(input: string): string {
    // lookup base item name
    for (const item of BaseItems) {
      if (item.value === input.toString()) {
        return item.label;
      }
    }
    return "Error: BaseItem not found";
  }

  // Add HTML elements to the list
  private addRow(item: string, index: number) {
    const inventoryListItem = buildTextField({
      id: "rst_item_" + index.toString(),
      value: this.formatItem(item),
      disabled: true,
      style: undefined,
      className: undefined,
      maxLength: 16,
      buttonType: ButtonType.delete,
    });

    const btns = inventoryListItem.querySelectorAll("vscode-button");
    const delButton = btns[0];
    if (delButton) delButton.addEventListener("click", (e) => this.deleteClickEventHandler(e, index));

    this._listDiv.appendChild(inventoryListItem);
  }

  // Add the item to the list then refresh the list
  private addClickEventHandler(e: Event, newValue: string) {
    const oldValue = this._content.RestrictionList.addItem(newValue);

    // if the item already exists then do nothing
    if (!oldValue) return;

    // clear the fields
    const textField = document.getElementById("RestrictionAddItem") as HTMLInputElement;
    if (textField) textField.value = "";

    this.refreshList();

    if (oldValue === newValue) {
      this.dispatchEvent(new CustomEvent("RestrictionList_change", { detail: { field: this.id, undefined, newValue } }));
    }
  }

  // Delete the item from the list then refresh the list
  private deleteClickEventHandler(e: Event, index: number) {
    const oldValue = this._content.RestrictionList.deleteItem(index);
    this.refreshList();

    if (oldValue) {
      this.dispatchEvent(
        new CustomEvent("RestrictionList_change", {
          detail: { field: "RestrictionList_item_" + index.toString(), oldValue, newValue: undefined },
        }),
      );
    }
  }

  private changeEventHandler(e: Event, index: number) {
    const newValue = (e.target as HTMLInputElement).value;
    const oldValue = this._content.RestrictionList.updateItem(index, newValue);

    this.dispatchEvent(
      new CustomEvent("RestrictionList_change", {
        detail: { field: "RestrictionList_item_" + index.toString(), oldValue, newValue },
      }),
    );
  }

  private gotoClickEventHandler(e: Event, index: number) {
    throw new Error("Method not implemented.");
  }

  private buildRestrictionList(): HTMLDivElement {
    const fieldset = document.createElement("fieldset");
    fieldset.id = "RestrictionList";
    fieldset.style.width = "320px";
    fieldset.style.display = "grid";
    fieldset.style.padding = "5px 5px 5px 5px";
    fieldset.style.borderColor = "var(--input-placeholder-foreground)";
    fieldset.style.borderStyle = "inset";

    const inputCol = buildDiv("col-input");
    inputCol.appendChild(fieldset);

    // Store reference to the fieldset so we can add/remove children
    this._listDiv = fieldset;
    return inputCol;
  }

  private buildListRow(): HTMLDivElement {
    const listLabelCol = buildLabelColumn("Restricted Items", "RestrictionList");
    const listInputCol = this.buildRestrictionList();

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
      this.addClickEventHandler(e, (document.getElementById("RestrictionListAdd") as HTMLInputElement).value),
    );

    return AddButton;
  }

  private readonly _addRowHtml: string = `
    <nwn-drop-down id="RestrictionListAdd" label="Add Base Item" listRef="BaseItems"></nwn-drop-down>
  `;

  private readonly _addButtonHtml: string = `
  <nwn-row label=" ">
    <vscode-button id="RestrictionListAddButton">Add</vscode-button>
  </nwn-row>
    `;
}
