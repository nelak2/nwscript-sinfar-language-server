import { buildLabel, buildDiv, buildButton } from "./utils";
import { VarType } from "./lists/index";

type Variable = {
  name: string;
  varType: string;
  value: string;
};

export class nwnVariables extends HTMLElement {
  _variables: Variable[];
  _variableListDiv: HTMLDivElement;
  constructor() {
    super();

    let variables: Variable[] = [];
    try {
      variables = JSON.parse(this.getAttribute("variables") ?? "[]");
    } catch {
      console.log("Error parsing variables");
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
    const textFieldName = this.buildTextField("");
    const dropdownType = this.buildDropdown(VarType[0].value);
    const textFieldValue = this.buildTextField("");
    const buttonAdd = buildButton("add");
    variableAddRow.appendChild(textFieldName);
    variableAddRow.appendChild(dropdownType);
    variableAddRow.appendChild(textFieldValue);
    variableAddRow.appendChild(buttonAdd);
    this.appendChild(variableAddRow);

    // add event listeners
    buttonAdd.addEventListener("click", () => {
      this.addVariable(textFieldName, dropdownType, textFieldValue);
    });

    this.refreshVariables();
  }

  addVariable(textFieldName: HTMLElement, dropdownType: HTMLElement, textFieldValue: HTMLElement) {
    // check if variable already exists
    const name = textFieldName.getAttribute("current-value") || "";
    if (name === "") {
      console.log("Variable name cannot be empty");
      return;
    }

    if (this._variables.find((variable) => variable.name === name)) {
      console.log("Variable already exists");
      return;
    }

    // validate type
    const varType = dropdownType.getAttribute("current-value") || "";
    if (varType === "") {
      console.log("Variable type cannot be empty");
      return;
    }

    // validate value
    let value = textFieldValue.getAttribute("current-value") || "";
    if (value === "") {
      console.log("Variable value cannot be empty");
      return;
    }

    console.log("name: " + name);
    console.log("varType: " + varType);
    console.log("value: " + value);
    if (varType === "1" && isNaN(parseInt(value))) {
      console.log("Variable value must be an integer");
      return;
    } else if (varType === "2" && isNaN(parseFloat(value))) {
      console.log("Variable value must be a float");
      return;
    }

    // Cast to int/float and back to string to remove decimal places for ints
    // and add trailing 0s for floats
    if (varType === "1") {
      const intValue = parseInt(value);
      value = intValue.toString();
    } else if (varType === "2") {
      const floatValue = parseFloat(value);
      value = floatValue.toString();
    }

    this._variables.push({
      name,
      varType,
      value,
    });
    this.refreshVariables();
  }

  deleteVariable(variableRow: HTMLElement) {
    const name = variableRow.children[0].getAttribute("current-value") || "";
    this._variables = this._variables.filter((variable) => variable.name !== name);
    this.removeRow(variableRow);
  }

  refreshVariables() {
    this._variableListDiv.replaceChildren();
    // create variable rows
    for (const variable of this._variables) {
      this.addRow(variable);
    }
  }

  addRow(variable: Variable) {
    if (!this._variableListDiv) return;

    const variableRow = buildDiv("variableRow");
    const textFieldName = this.buildTextField(variable.name);
    const dropdownType = this.buildDropdown(variable.varType);
    const textFieldValue = this.buildTextField(variable.value);
    const buttonDelete = buildButton("close");
    variableRow.appendChild(textFieldName);
    variableRow.appendChild(dropdownType);
    variableRow.appendChild(textFieldValue);
    variableRow.appendChild(buttonDelete);
    this._variableListDiv.appendChild(variableRow);

    // add event listeners
    buttonDelete.addEventListener("click", () => {
      this.deleteVariable(variableRow);
    });
  }

  removeRow(variableRow: HTMLElement) {
    this._variableListDiv.removeChild(variableRow);
  }

  buildTextField(value: string): HTMLElement {
    const textField = document.createElement("vscode-text-field");
    textField.className = "variableField";
    textField.setAttribute("value", value);
    return textField;
  }

  buildDropdown(value: string): HTMLElement {
    const dropdown = document.createElement("vscode-dropdown");
    dropdown.className = "varTypeDropdown";

    for (const type of VarType) {
      const option = document.createElement("vscode-option");
      option.setAttribute("value", type.value);
      option.textContent = type.label;
      dropdown.appendChild(option);
    }

    dropdown.setAttribute("current-value", value);
    return dropdown;
  }

  get variables() {
    return JSON.stringify(this._variables);
  }

  set variables(value) {
    if (value) {
      this.setAttribute("variables", value);
      this._variables = JSON.parse(value);
    } else {
      this.removeAttribute("variables");
    }
    this.refreshVariables();
  }
}

// <div class="variableRow">
//   <label for="variablesList" style="width: 162.5px; padding-inline: 5px">Name</label>
//   <label class="vscode-input-label-varheader" style="width: 70px; padding-inline: 5px" for="variablesList">Type</label>
//   <label class="vscode-input-label-varheader" style="padding-inline: 5px" for="variablesList">Value</label>
// </div>
// <div class="variableRow">
//   <vscode-text-field class="variableField"></vscode-text-field>
//   <vscode-dropdown class="varTypeDropdown">
//     <vscode-option value="1">Int</vscode-option>
//     <vscode-option value="2">Float</vscode-option>
//     <vscode-option value="3">String</vscode-option>
//   </vscode-dropdown>
//   <vscode-text-field class="variableField"></vscode-text-field>
//   <vscode-button appearance="icon" aria-label="Delete">
//     <span class="codicon codicon-close"></span>
//   </vscode-button>
// </div>
// <vscode-divider style="width: 455px"></vscode-divider>
// <div class="variableRow">
//   <vscode-text-field class="variableField"></vscode-text-field>
//   <vscode-dropdown class="varTypeDropdown">
//     <vscode-option value="1">Int</vscode-option>
//     <vscode-option value="2">Float</vscode-option>
//     <vscode-option value="3">String</vscode-option>
//   </vscode-dropdown>
//   <vscode-text-field class="variableField"></vscode-text-field>
//   <vscode-button appearance="icon" aria-label="Add">
//   <span class="codicon codicon-add"></span>
//   </vscode-button>
// </div>
