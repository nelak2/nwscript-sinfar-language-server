import { Uti } from "../editorProviders/resData";
import { ItemProperty } from "../editorProviders/resData/uti";
import { ipSubType, ipType, ipValueParamType, ipValueType } from "./lists";
import { buildTextField, ButtonType } from "./utils";

export class nwnItemProperties extends HTMLElement {
  _content!: Uti;

  _ipTypeField!: HTMLSelectElement;
  _ipSubTypeField!: HTMLSelectElement;
  _ipValueField!: HTMLSelectElement;
  _ipValueParamField!: HTMLSelectElement;

  _ipTypeFieldRow!: HTMLElement;
  _ipSubTypeFieldRow!: HTMLElement;
  _ipValueFieldRow!: HTMLElement;
  _ipValueParamFieldRow!: HTMLElement;

  _listDiv!: HTMLElement;

  constructor() {
    super();
    this.innerHTML = this._html;

    const dropdowns = this.querySelectorAll("nwn-drop-down");
    this._listDiv = this.querySelector("#item-property-list") as HTMLElement;

    dropdowns.forEach((d) => {
      const label = d.getAttribute("label") || "";
      if (label === "Type") {
        this._ipTypeFieldRow = d as HTMLElement;
      }
      if (label === "Sub Type") {
        this._ipSubTypeFieldRow = d as HTMLElement;
      }
      if (label === "Value") {
        this._ipValueFieldRow = d as HTMLElement;
      }
      if (label === "Value Param") {
        this._ipValueParamFieldRow = d as HTMLElement;
      }
    }, this);

    this.HideAll();

    this._ipTypeField = this.querySelector("#ItemProperty_Type") as HTMLSelectElement;
    this._ipSubTypeField = this.querySelector("#ItemProperty_SubType") as HTMLSelectElement;
    this._ipValueField = this.querySelector("#ItemProperty_Value") as HTMLSelectElement;
    this._ipValueParamField = this.querySelector("#ItemProperty_ValueParam") as HTMLSelectElement;

    this._ipTypeField.addEventListener("change", this.HandleDropDownChange.bind(this));
    this._ipSubTypeField.addEventListener("change", this.HandleDropDownChange.bind(this));
    this._ipValueField.addEventListener("change", this.HandleDropDownChange.bind(this));
    this._ipValueParamField.addEventListener("change", this.HandleDropDownChange.bind(this));

    const addBtn = document.getElementById("ItemPropertyAddButton");
    addBtn?.addEventListener("click", (e) => this.addClickEventHandler(e));
  }

  public RefreshList() {
    const propertyList = this._content.ItemProperties.getPropertyList();

    this._listDiv.replaceChildren();

    for (let i = 0; i < propertyList.length; i++) {
      this.addRow(propertyList[i], i);
    }
  }

  private addRow(property: ItemProperty, index: number) {
    const propertyListItem = buildTextField({
      id: "itm_prop_" + index.toString(),
      value: property.DisplayName || "Error",
      disabled: true,
      style: undefined,
      className: undefined,
      buttonType: ButtonType.delete,
      maxLength: undefined,
    });

    const delButton = propertyListItem.querySelector("vscode-button");
    if (delButton) delButton.addEventListener("click", (e) => this.deleteClickEventHandler(e, index));

    this._listDiv.appendChild(propertyListItem);
  }

  public Update(index: number, newValue: ItemProperty, oldValue: ItemProperty) {
    // If newValue is undefined then the item was deleted
    if (newValue === undefined && index >= 0) {
      this._content.ItemProperties.deleteProperty(index);
    }

    // If oldValue is undefined then the item was added
    if (oldValue === undefined) {
      this._content.ItemProperties.addProperty(newValue);
    }

    this.RefreshList();
  }

  addClickEventHandler(e: Event): void {
    const ipType = this._ipTypeField.getAttribute("current-value");
    const ipSubType = this._ipSubTypeField.getAttribute("current-value");
    const ipValueType = this._ipValueField.getAttribute("current-value");
    const ipValueParamType = this._ipValueParamField.getAttribute("current-value");

    const newValue = this._content.ItemProperties.buildProperty(ipType, ipSubType, ipValueType, ipValueParamType);
    this._content.ItemProperties.addProperty(newValue);

    this.RefreshList();

    if (newValue) {
      this.dispatchEvent(
        new CustomEvent("ItemProperty_change", {
          detail: {
            field: "itm_prop_" + (this._content.ItemProperties.getPropertyList().length - 1).toString(),
            oldValue: undefined,
            newValue,
          },
        }),
      );
    }
  }

  deleteClickEventHandler(e: Event, index: number): void {
    const oldValue = this._content.ItemProperties.deleteProperty(index);
    this.RefreshList();

    if (oldValue) {
      this.dispatchEvent(
        new CustomEvent("ItemProperty_change", {
          detail: {
            field: "itm_prop_" + index.toString(),
            oldValue,
            newValue: undefined,
          },
        }),
      );
    }
  }

  public Init(content: Uti) {
    this._content = content;

    const currentSelection = this._ipTypeField.getAttribute("current-value") || "1";

    this.SetType(currentSelection);

    this.RefreshList();
  }

  private HideAll() {
    this._ipSubTypeFieldRow.style.display = "none";
    this._ipValueFieldRow.style.display = "none";
    this._ipValueParamFieldRow.style.display = "none";
  }

  private SetType(selection: string) {
    this.HideAll();
    const type = ipType.find((t) => t.value === selection);

    if (!type) return;

    if (type.subType !== "") {
      this.SetSubType(type.subType);
    }

    if (type.valueType !== "") {
      this.SetValueType(type.valueType);
    }

    if (type.valueParamType !== "") {
      this.SetValueParamType(type.valueParamType);
    }
  }

  private SetSubType(newSubType: string) {
    this._ipSubTypeFieldRow.style.display = "block";

    const values = ipSubType.filter((v) => v.subType === newSubType);

    if (values.length === 0) return;

    this.LoadOptions(this._ipSubTypeField, values);
  }

  private SetValueType(newValueType: string) {
    this._ipValueFieldRow.style.display = "block";

    const values = ipValueType.filter((v) => v.valueType === newValueType);

    if (values.length === 0) return;

    this.LoadOptions(this._ipValueField, values);
  }

  private SetValueParamType(newValueParamType: string) {
    this._ipValueParamFieldRow.style.display = "block";

    const values = ipValueParamType.filter((v) => v.valueParamType === newValueParamType);

    if (values.length === 0) return;

    this.LoadOptions(this._ipValueParamField, values);
  }

  private LoadOptions(dropdown: HTMLElement, list: any) {
    dropdown.replaceChildren();

    for (let i = 0; i < list.length; i++) {
      const value = list[i];
      const option = document.createElement("vscode-option");
      option.setAttribute("value", value.value);
      option.textContent = value.label;
      dropdown.appendChild(option);
    }
  }

  private HandleDropDownChange(e: Event) {
    const target = e.target as HTMLElement;

    const id = target.getAttribute("id") || "";
    const value = (target as HTMLSelectElement).value;

    if (id === "ItemProperty_Type") {
      this.SetType(value);
    }
  }

  private readonly _html: string = `
<div class="row">
  <div class="col-label">
    <label class="vscode-input-label" for="">Properties:</label>
  </div>
  <div class="col-input">
    <fieldset id="item-property-list" style="display: grid; padding: 5px; width: 410px;">

    </fieldset>
  </div>
</div>

<div class="row">
  <div class="col-label">
      <label class="vscode-input-label" for="">Add Item Property:</label>
  </div>
  <div class="col-input">
      <nwn-drop-down id="ItemProperty_Type" label="Type" listRef="ipType"></nwn-drop-down>
      <nwn-drop-down id="ItemProperty_SubType" label="Sub Type" listRef="ipSubType"></nwn-drop-down>
      <nwn-drop-down id="ItemProperty_Value" label="Value" listRef="ipValueType"></nwn-drop-down>
      <nwn-drop-down id="ItemProperty_ValueParam" label="Value Param" listRef="ipValueParamType"></nwn-drop-down>
      <nwn-row label=" ">
          <vscode-button id="ItemPropertyAddButton">Add</vscode-button>
      </nwn-row>
  </div>
</div>
  `;
}
