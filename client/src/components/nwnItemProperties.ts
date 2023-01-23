import { values } from "lodash";
import { Uti } from "../editorProviders/resData";
import { ipSubType, ipType, ipValueParamType, ipValueType } from "./lists";

export class nwnItemProperties extends HTMLElement {
  _content!: Uti;

  _ipTypeField!: HTMLElement;
  _ipSubTypeField!: HTMLElement;
  _ipValueField!: HTMLElement;
  _ipValueParamField!: HTMLElement;

  _ipTypeFieldRow!: HTMLElement;
  _ipSubTypeFieldRow!: HTMLElement;
  _ipValueFieldRow!: HTMLElement;
  _ipValueParamFieldRow!: HTMLElement;

  constructor() {
    super();
    this.innerHTML = this._html;

    const dropdowns = this.querySelectorAll("nwn-drop-down");

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

    this._ipTypeField = this.querySelector("#ItemProperty_Type") as HTMLElement;
    this._ipSubTypeField = this.querySelector("#ItemProperty_SubType") as HTMLElement;
    this._ipValueField = this.querySelector("#ItemProperty_Value") as HTMLElement;
    this._ipValueParamField = this.querySelector("#ItemProperty_ValueParam") as HTMLElement;

    this._ipTypeField.addEventListener("change", this.HandleDropDownChange.bind(this));
    this._ipSubTypeField.addEventListener("change", this.HandleDropDownChange.bind(this));
    this._ipValueField.addEventListener("change", this.HandleDropDownChange.bind(this));
    this._ipValueParamField.addEventListener("change", this.HandleDropDownChange.bind(this));
  }

  public Init(content: Uti) {
    this._content = content;

    const currentSelection = (this._ipTypeField as HTMLSelectElement).getAttribute("current-value") || "1";

    this.SetType(currentSelection);
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
