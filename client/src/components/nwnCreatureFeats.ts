import { Utc } from "../editorProviders/resData";
import { Feats } from "./lists";
import { buildTextField, buildLabelColumn, buildDiv, ButtonType } from "./utils";

export class nwnCreatureFeats extends HTMLElement {
  _content!: Utc;
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

  public Init(content: Utc) {
    this._content = content;

    this.refreshList();
  }

  public Update(index: number, newValue: number, oldValue: number) {
    // If newValue is undefined then the item was deleted
    if (newValue === undefined && index >= 0) {
      this._content.FeatList.removeFeatByIndex(index);
    }

    // If oldValue is undefined then the item was added
    if (oldValue === undefined) {
      this._content.FeatList.addFeat(newValue);
    }

    this.refreshList();
  }

  private refreshList() {
    // Clear the list
    this._listDiv.replaceChildren();
    const items = this._content.FeatList.getFeatList();

    // Add each item to the list
    for (let i = 0; i < items.length; i++) {
      this.addRow(items[i].name, i);
    }
  }

  // Add HTML elements to the list
  private addRow(feat: string, index: number) {
    const featListItem = buildTextField({
      id: "feat_item_" + index.toString(),
      value: feat,
      disabled: true,
      style: undefined,
      className: undefined,
      maxLength: undefined,
      buttonType: ButtonType.delete,
    });

    const btns = featListItem.querySelectorAll("vscode-button");
    const delButton = btns[0];
    if (delButton) delButton.addEventListener("click", (e) => this.deleteClickEventHandler(e, index));

    this._listDiv.appendChild(featListItem);
  }

  // Add the item to the list then refresh the list
  private addClickEventHandler(e: Event, newValue: number) {
    const oldValue = this._content.FeatList.addFeat(newValue);

    // if the item already exists then do nothing
    if (!oldValue) return;

    this.refreshList();

    this.dispatchEvent(new CustomEvent("FeatList_change", { detail: { field: this.id, undefined, newValue } }));
  }

  // Delete the item from the list then refresh the list
  private deleteClickEventHandler(e: Event, index: number) {
    const oldValue = this._content.FeatList.removeFeatByIndex(index);
    this.refreshList();

    if (oldValue) {
      this.dispatchEvent(
        new CustomEvent("FeatList_change", {
          detail: { field: "FeatList_item_" + index.toString(), oldValue, newValue: undefined },
        }),
      );
    }
  }

  private gotoClickEventHandler(e: Event, index: number) {
    throw new Error("Method not implemented.");
  }

  private buildFeatList(): HTMLDivElement {
    const fieldset = document.createElement("fieldset");
    fieldset.id = "FeatList";
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
    const listLabelCol = buildLabelColumn("Feats", "FeatList");
    const listInputCol = this.buildFeatList();

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
      this.addClickEventHandler(e, parseInt((document.getElementById("FeatListAdd") as HTMLInputElement).value)),
    );

    return AddButton;
  }

  private readonly _addRowHtml: string = `
  <nwn-row label="Add Feat">
    <nwn-drop-down-large id="FeatListAdd" listRef="Feats"></nwn-drop-down-large>
  </nwn-row>
  `;

  private readonly _addButtonHtml: string = `
  <nwn-row label=" ">
    <vscode-button id="FeatListAddButton">Add</vscode-button>
  </nwn-row>
    `;
}
