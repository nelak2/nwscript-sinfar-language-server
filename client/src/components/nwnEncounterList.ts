import { Ute, CreatureListItem } from "../editorProviders/resData";
import { buildTextField, buildLabelColumn, buildDiv, ButtonType } from "./utils";

export class nwnEncounterList extends HTMLElement {
  _content!: Ute;
  _listDiv!: HTMLFieldSetElement;
  constructor() {
    super();

    const listRow = this.buildListRow();
    const addRow = this.buildAddRow();

    this.appendChild(listRow);
    this.appendChild(addRow);
  }

  public Init(content: Ute) {
    this._content = content;

    this.refreshList();
  }

  public Update(index: number, newValue: CreatureListItem, oldValue: CreatureListItem) {
    // If newValue is undefined then the item was deleted
    if (newValue === undefined && index >= 0) {
      this._content.CreatureList.deleteItem(index);
    }

    // If oldValue is undefined then the item was added
    if (oldValue === undefined) {
      this._content.CreatureList.addItem(newValue);
    }

    // If neither newValue or oldValue are undefined then the item was updated
    if (newValue !== undefined && oldValue !== undefined) {
      this._content.CreatureList.updateItem(index, newValue);
    }

    this.refreshList();
  }

  private refreshList() {
    // Clear the list
    this._listDiv.replaceChildren();
    const items = this._content.CreatureList.getItemList();

    // Add each item to the list
    for (let i = 0; i < items.length; i++) {
      this.addRow(items[i], i);
    }
  }

  private formatItem(item: CreatureListItem): string {
    const resref: string = item.Resref;
    const unique = item.Unique;
    return `${resref} ${unique ? "(Unique)" : ""}`;
  }

  // Add HTML elements to the list
  private addRow(item: CreatureListItem, index: number) {
    const inventoryListItem = buildTextField({
      id: "enc_item_" + index.toString(),
      value: this.formatItem(item),
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

    this._listDiv.appendChild(inventoryListItem);
  }

  // Add the item to the list then refresh the list
  private addClickEventHandler(e: Event, newValue: CreatureListItem) {
    const oldValue = this._content.CreatureList.addItem(newValue);

    // if the item already exists then do nothing
    if (!oldValue) return;

    // clear the fields
    const textField = document.getElementById("EncounterAddResRef") as HTMLInputElement;
    if (textField) textField.value = "";

    const uniqueField = document.getElementById("EncounterAddUnique") as HTMLInputElement;
    if (uniqueField) uniqueField.checked = false;

    this.refreshList();

    if (oldValue.Resref === newValue.Resref) {
      this.dispatchEvent(new CustomEvent("EncounterList_change", { detail: { field: this.id, undefined, newValue } }));
    }
  }

  // Delete the item from the list then refresh the list
  private deleteClickEventHandler(e: Event, index: number) {
    const oldValue = this._content.CreatureList.deleteItem(index);
    this.refreshList();

    if (oldValue) {
      this.dispatchEvent(
        new CustomEvent("EncounterList_change", {
          detail: { field: "EncounterList_item_" + index.toString(), oldValue, newValue: undefined },
        }),
      );
    }
  }

  private changeEventHandler(e: Event, index: number) {
    const newValue = this._content.CreatureList.getItemByResRef((e.target as HTMLInputElement).value);
    if (!newValue) return;

    const oldValue = this._content.CreatureList.updateItem(index, newValue);

    this.dispatchEvent(
      new CustomEvent("EncounterList_change", {
        detail: { field: "EncounterList_item_" + index.toString(), oldValue, newValue },
      }),
    );
  }

  private gotoClickEventHandler(e: Event, index: number) {
    throw new Error("Method not implemented.");
  }

  private buildInventoryList(): HTMLDivElement {
    const fieldset = document.createElement("fieldset");
    fieldset.id = "EncounterList";
    fieldset.style.width = "190px";
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
    const listLabelCol = buildLabelColumn("Creature List", "EncounterList");
    const listInputCol = this.buildInventoryList();

    const listRow = buildDiv("row");
    listRow.appendChild(listLabelCol);
    listRow.appendChild(listInputCol);
    return listRow;
  }

  private buildAddRow(): HTMLDivElement {
    const AddLabelCol = buildLabelColumn("Add Creature", "EncounterListAdd_txt");

    const AddUniqueCol = this.buildCheckBox("EncounterListAdd_Unique", "Unique", false);

    const AddInputCol = buildTextField({
      id: "EncounterListAdd_txt",
      value: undefined,
      disabled: false,
      style: undefined,
      className: undefined,
      maxLength: 16,
      buttonType: ButtonType.add,
    }) as HTMLInputElement;

    // Add event handlers
    const addBtn = AddInputCol.querySelector("vscode-button");
    if (addBtn !== null) {
      addBtn.addEventListener("click", (e) =>
        this.addClickEventHandler(e, { Resref: AddInputCol.value, Unique: AddUniqueCol.checked, CR: 0 }),
      );
    }
    AddInputCol.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.addClickEventHandler(e, { Resref: AddInputCol.value, Unique: AddUniqueCol.checked, CR: 0 });
      }
    });

    const AddRow = buildDiv("row");
    AddRow.appendChild(AddLabelCol);
    AddRow.appendChild(AddUniqueCol);
    AddRow.appendChild(AddInputCol);
    return AddRow;
  }

  private buildCheckBox(id: string, label: string, checked: boolean): HTMLInputElement {
    const checkbox = document.createElement("vscode-checkbox") as HTMLInputElement;
    checkbox.id = id;
    checkbox.innerText = label;
    checkbox.checked = checked;

    return checkbox;
  }
}
