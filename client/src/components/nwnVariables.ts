import { buildLabel, buildDiv, buildButton, buildDropdown, buildTextField } from "./utils";
import { VarType } from "./lists/index";

type Variable = {
  name: string;
  varType: number;
  value: string | number;
};

export class nwnVariables extends HTMLElement {
  // Specify observed attributes so that
  // attributeChangedCallback will work
  static get observedAttributes() {
    return ["current-value"];
  }

  _variables: Variable[];
  _variableListDiv: HTMLDivElement;

  constructor() {
    super();

    let variables: Variable[] = [];
    try {
      variables = JSON.parse(this.getAttribute("variables") ?? "[]");
    } catch (error: any) {
      window.dispatchEvent(new CustomEvent("alert", { detail: error.message }));
    }

    this._variables = variables;

    // create headers
    const variableRow = buildDiv("variableRow");
    const labelName = buildLabel("Name", "");
    labelName.setAttribute("style", "width: 162.5px; padding-inline: 5px");
    const labelType = buildLabel("Type", "");
    labelType.setAttribute("style", "width: 70px; padding-inline: 5px");
    const labelValue = buildLabel("Value", "");
    labelValue.setAttribute("style", "padding-inline: 5px");
    variableRow.appendChild(labelName);
    variableRow.appendChild(labelType);
    variableRow.appendChild(labelValue);
    this.appendChild(variableRow);

    const variableListDiv = buildDiv("");
    variableListDiv.id = "nwn-variable-list";
    this.appendChild(variableListDiv);
    this._variableListDiv = variableListDiv;

    const divider = document.createElement("vscode-divider");
    divider.setAttribute("style", "width: 455px");
    this.appendChild(divider);

    // create new variable row
    const variableAddRow = buildDiv("variableRow");
    const textFieldName = buildTextField("", "nwnvartable_add_name");
    const dropdownType = buildDropdown(VarType[0].value, "nwnvartable_add_type");
    const textFieldValue = buildTextField("", "nwnvartable_add_value");
    const buttonAdd = buildButton("add", "vartable_add_btn");
    variableAddRow.appendChild(textFieldName);
    variableAddRow.appendChild(dropdownType);
    variableAddRow.appendChild(textFieldValue);
    variableAddRow.appendChild(buttonAdd);
    this.appendChild(variableAddRow);

    // add event listeners
    buttonAdd.addEventListener("click", (e) => {
      this.addVariable(e, textFieldName, dropdownType, textFieldValue);
    });

    this.refreshVariables();
  }

  // update fields when their values change
  onFieldChanged(fieldId: number, changeType: string, e: Event) {
    const newValue = (e.target as HTMLInputElement).value;

    switch (changeType) {
      case "name": {
        // validate name
        try {
          this.validateVariable(newValue, this._variables[fieldId].varType, this._variables[fieldId].value, true);
        } catch (error: any) {
          window.dispatchEvent(new CustomEvent("alert", { detail: error.message }));

          // revert to old value
          (e.target as HTMLInputElement).value = this._variables[fieldId].name;
        }

        this._variables[fieldId].name = newValue;
        break;
      }
      case "type": {
        try {
          this.validateVariable(this._variables[fieldId].name, parseInt(newValue), this._variables[fieldId].value);
        } catch (error: any) {
          window.dispatchEvent(new CustomEvent("alert", { detail: error.message }));

          // revert to old value
          (e.target as HTMLSelectElement).selectedIndex = this._variables[fieldId].varType - 1;
        }

        this._variables[fieldId].varType = (e.target as HTMLSelectElement).selectedIndex + 1;

        break;
      }
      case "value":
        try {
          this.validateVariable(this._variables[fieldId].name, this._variables[fieldId].varType, newValue);
        } catch (error: any) {
          window.dispatchEvent(new CustomEvent("alert", { detail: error.message }));

          // revert to old value
          (e.target as HTMLInputElement).value = this._variables[fieldId].value.toString();
        }

        this._variables[fieldId].value = newValue;
        break;
    }

    // Make sure value field is formatted correctly
    const valueField = document.getElementById(`var_value_${fieldId}`) as HTMLInputElement;
    const currentValue = valueField.getAttribute("current-value") ?? "0";
    valueField.setAttribute("current-value", this.formatValue(currentValue, this._variables[fieldId].varType));
  }

  validateVariable(name: string, varType: number, value: string | number, checkNameExists = false) {
    // check variable name is not empty
    if (name === "") {
      throw new Error("Variable name cannot be empty");
    }

    // check variable name is valid
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      throw new Error("Variable name is invalid");
    }

    if (checkNameExists && this._variables.find((variable) => variable.name === name)) {
      throw new Error("Variable already exists");
    }

    // validate type;
    if (varType === 0) {
      throw new Error("Variable type cannot be empty");
    }

    // validate value
    if (value === "") {
      throw new Error("Variable value cannot be empty");
    }

    if (varType === 1 && isNaN(parseInt(value as string))) {
      throw new Error("Variable value must be an integer");
    } else if (varType === 2 && isNaN(parseFloat(value as string))) {
      throw new Error("Variable value must be a float");
    }
  }

  formatValue(value: string, varType: number): string {
    // Cast to int/float and back to string to remove decimal places for ints
    // and add trailing 0s for floats
    if (varType === 1) {
      return parseInt(value).toString();
    } else if (varType === 2) {
      return parseFloat(value).toString();
    }
    return value;
  }

  addVariable(e: Event, textFieldName: HTMLElement, dropdownType: HTMLElement, textFieldValue: HTMLElement) {
    const name = textFieldName.getAttribute("current-value") || "";
    const varType = parseInt(dropdownType.getAttribute("current-value") || "0");
    let value = textFieldValue.getAttribute("current-value") || "";

    try {
      this.validateVariable(name, varType, value, true);
    } catch (error: any) {
      window.dispatchEvent(new CustomEvent("alert", { detail: error.message }));
      return;
    }

    value = this.formatValue(value, varType);

    this._variables.push({
      name,
      varType,
      value,
    });
    this.refreshVariables();

    // Dispatch event to notify parent that variable table has changed
    e.target?.dispatchEvent(new Event("change", { bubbles: true, composed: true, cancelable: true }));
  }

  deleteVariable(e: Event, variableRow: HTMLElement) {
    const name = variableRow.children[0].getAttribute("current-value") || "";

    this._variables = this._variables.filter((variable) => variable.name !== name);

    // Dispatch event to notify parent that variable table has changed
    e.target?.dispatchEvent(new Event("change", { bubbles: true, composed: true, cancelable: true }));

    this.refreshVariables();
  }

  refreshVariables() {
    this._variableListDiv.replaceChildren();
    // create variable rows

    for (let i = 0; i < this._variables.length; i++) {
      this.addRow(i.toString(), this._variables[i]);
    }
  }

  public getVarTable() {
    const variableArray = [];
    for (const variable of this._variables) {
      const name = [10, variable.name];
      const varType = [4, variable.varType];
      const value = [this.getNWNGFFType(variable.varType), variable.value];

      const GFFElement = [0, { Name: name, Type: varType, Value: value }];

      variableArray.push(GFFElement);
    }

    return [15, variableArray];
  }

  public updateVarTable(varFieldId: number, varTableUpdateType: string, newValue: any) {
    const updateField = document.getElementById(`var_${varTableUpdateType}_${varFieldId}`) as HTMLInputElement;
    updateField.setAttribute("current-value", newValue);
    switch (varTableUpdateType) {
      case "name":
        this._variables[varFieldId].name = newValue;
        break;
      case "type": {
        this._variables[varFieldId].varType = newValue;

        // make sure the value field in our variable array is properly formatted when the type changes
        const formattedValue = this.formatValue(this._variables[varFieldId].value.toString(), parseInt(newValue));

        this._variables[varFieldId].value = formattedValue;

        // make sure the value field in the UI is properly formatted when the type changes
        const valueField = document.getElementById(`var_value_${varFieldId}`) as HTMLInputElement;
        valueField.setAttribute("current-value", formattedValue);
        break;
      }
      case "value":
        this._variables[varFieldId].value = newValue;
        break;
    }
  }

  SetVarTable(newValue: any) {
    this._variables = [];

    for (const variable of newValue[1]) {
      this._variables.push({
        name: variable[1].Name[1],
        varType: variable[1].Type[1],
        value: variable[1].Value[1],
      });
    }

    this.refreshVariables();
  }

  getNWNGFFType(varType: number): number {
    // For some reason doing the comparison with === always returns false
    // Not clear why, but this works for now
    // eslint-disable-next-line eqeqeq
    if (varType == 1) return 5; // int
    // eslint-disable-next-line eqeqeq
    if (varType == 2) return 8; // float
    // eslint-disable-next-line eqeqeq
    if (varType == 3) return 10; // string

    return 10; // default to string
  }

  addRow(fieldId: string, variable: Variable) {
    if (!this._variableListDiv) return;

    const variableRow = buildDiv("variableRow");
    const textFieldName = buildTextField(variable.name, "var_name_" + fieldId);
    const dropdownType = buildDropdown(variable.varType.toString(), "var_type_" + fieldId);
    const textFieldValue = buildTextField(variable.value.toString(), "var_value_" + fieldId);
    const buttonDelete = buildButton("close", "var_del_" + fieldId);
    variableRow.appendChild(textFieldName);
    variableRow.appendChild(dropdownType);
    variableRow.appendChild(textFieldValue);
    variableRow.appendChild(buttonDelete);
    this._variableListDiv.appendChild(variableRow);

    // add event listeners
    buttonDelete.addEventListener("click", (e) => {
      this.deleteVariable(e, variableRow);
    });
    textFieldName.addEventListener("change", (e) => {
      this.onFieldChanged(Number.parseInt(fieldId), "name", e);
    });
    dropdownType.addEventListener("change", (e) => {
      this.onFieldChanged(Number.parseInt(fieldId), "type", e);
    });
    textFieldValue.addEventListener("change", (e) => {
      this.onFieldChanged(Number.parseInt(fieldId), "value", e);
    });
  }

  removeRow(variableRow: HTMLElement) {
    this._variableListDiv.removeChild(variableRow);
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "current-value") {
      const variables = JSON.parse(newValue);
      this._variables = [];

      for (const variable of variables) {
        this._variables.push({
          name: variable[1].Name[1],
          varType: variable[1].Type[1],
          value: variable[1].Value[1],
        });
      }

      this.refreshVariables();
    }
  }
}
