import { buildLabel, buildDiv, buildButton, buildDropdown, buildTextField } from "./utils";
import { VarType } from "./lists/index";
import { ResData } from "../editorProviders/resData/resdataProvider";
import { Variable } from "../api/types";

export class nwnVariables extends HTMLElement {
  _content!: ResData;
  _variables: Variable[] = [];
  _variableListDiv: HTMLDivElement;

  CHANGE_EVENT = "vartable_change";

  constructor() {
    super();

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

    // create variable list
    const variableListDiv = buildDiv("");
    variableListDiv.id = "nwn-variable-list";
    this.appendChild(variableListDiv);
    this._variableListDiv = variableListDiv;

    const divider = document.createElement("vscode-divider");
    divider.setAttribute("style", "width: 455px");
    this.appendChild(divider);

    // create add variable controls
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
      this.addVariable(e, { NameField: textFieldName, TypeField: dropdownType, ValueField: textFieldValue });
    });
  }

  public Init(content: ResData) {
    this._content = content;
    this._variables = content.variables.List;

    this.refreshVariables();
  }

  // update variable table from a message from the parent
  // Does not fire a change event
  public Update(fieldID: number, newValue: Variable) {
    let result: any;
    try {
      result = this.updateVarTable(fieldID, newValue);
    } catch (error: any) {
      window.dispatchEvent(new CustomEvent("alert", { detail: error.message }));
    }

    const row = this.getVariableRowElements(fieldID);
    this.setVariableToRowElements(row, result.newValue);
  }

  // update fields when their values change
  private onFieldChanged(fieldId: number, row: VariableRowElements, e: Event) {
    const newValue = this.getVariableFromRowElements(row);
    let result: any;
    try {
      result = this.updateVarTable(fieldId, newValue);
    } catch (error: any) {
      window.dispatchEvent(new CustomEvent("alert", { detail: error.message }));
    }

    if (result.oldValue && result.newValue) {
      this.setVariableToRowElements(row, result.newValue);

      this.dispatchEvent(
        new CustomEvent(this.CHANGE_EVENT, { detail: { oldValue: result.oldValue, newValue: result.newValue } }),
      );
      // If we failed to update the variable, revert to the old value
    } else if (result.oldValue) {
      this.setVariableToRowElements(row, result.oldValue);
    }
  }

  // Add new variable to table
  // Fires a change event to notify parent that variable table has changed
  private addVariable(e: Event, row: VariableRowElements) {
    let newValue: Variable = this.getVariableFromRowElements(row);

    try {
      newValue = this._content.variables.validateAndFormatVariable(newValue, true);
      this._content.variables.addVariable(newValue);
    } catch (error: any) {
      window.dispatchEvent(new CustomEvent("alert", { detail: error.message }));
      return;
    }

    this.refreshVariables();

    // Dispatch event to notify parent that variable table has changed
    e.target?.dispatchEvent(new CustomEvent(this.CHANGE_EVENT, { detail: { oldValue: undefined, newValue } }));

    // Reset fields
    row.NameField.setAttribute("current-value", "");
    row.ValueField.setAttribute("current-value", "");
  }

  // Deletes a variable from the list
  // Fires a change event to notify parent that variable table has changed
  private deleteVariable(e: Event, variableRow: HTMLElement) {
    const name = variableRow.children[0].getAttribute("current-value") || "";

    const oldValue = this._content.variables.deleteVariable(name);

    // If variable was not found, do nothing
    if (!oldValue) {
      return;
    }

    // Dispatch event to notify parent that variable table has changed
    e.target?.dispatchEvent(new CustomEvent(this.CHANGE_EVENT, { detail: { oldValue, newValue: undefined } }));

    this.refreshVariables();
  }

  // Replace the HTML for the variable table with the current variable list
  private refreshVariables() {
    this._variableListDiv.replaceChildren();
    this._variables = this._content.variables.List;

    for (let i = 0; i < this._variables.length; i++) {
      this.addRow(i.toString(), this._variables[i]);
    }
  }

  // Update an existing variable in the table
  private updateVarTable(index: number, variable: Variable): { oldValue: Variable; newValue: Variable } {
    // Try updating the vartable
    const newValue = this._content.variables.validateAndFormatVariable(variable);
    const oldValue = this._content.variables.updateVariable(index, newValue);

    if (!oldValue) {
      throw new Error("Variable not found");
    }

    return { oldValue, newValue };
  }

  private addRow(fieldId: string, variable: Variable) {
    if (!this._variableListDiv) return;

    const variableRow = buildDiv("variableRow");
    const textFieldName = buildTextField(variable.Name, "var_name_" + fieldId);
    const dropdownType = buildDropdown(variable.Type.toString(), "var_type_" + fieldId);
    const textFieldValue = buildTextField(variable.Value.toString(), "var_value_" + fieldId);
    const buttonDelete = buildButton("close", "var_del_" + fieldId);
    variableRow.appendChild(textFieldName);
    variableRow.appendChild(dropdownType);
    variableRow.appendChild(textFieldValue);
    variableRow.appendChild(buttonDelete);
    this._variableListDiv.appendChild(variableRow);

    const VariableRowElements: VariableRowElements = {
      NameField: textFieldName,
      TypeField: dropdownType,
      ValueField: textFieldValue,
    };

    // add event listeners
    buttonDelete.addEventListener("click", (e) => {
      this.deleteVariable(e, variableRow);
    });
    textFieldName.addEventListener("change", (e) => {
      this.onFieldChanged(Number.parseInt(fieldId), VariableRowElements, e);
    });
    dropdownType.addEventListener("change", (e) => {
      this.onFieldChanged(Number.parseInt(fieldId), VariableRowElements, e);
    });
    textFieldValue.addEventListener("change", (e) => {
      this.onFieldChanged(Number.parseInt(fieldId), VariableRowElements, e);
    });
  }

  private getVariableRowElements(fieldID: number): VariableRowElements {
    return {
      NameField: document.getElementById(`var_name_${fieldID}`) as HTMLInputElement,
      TypeField: document.getElementById(`var_type_${fieldID}`) as HTMLSelectElement,
      ValueField: document.getElementById(`var_value_${fieldID}`) as HTMLInputElement,
    };
  }

  private setVariableToRowElements(row: VariableRowElements, variable: Variable) {
    row.NameField.setAttribute("current-value", variable.Name);
    row.TypeField.setAttribute("current-value", variable.Type.toString());
    row.ValueField.setAttribute("current-value", variable.Value.toString());
  }

  // Get variable object from html row elements
  private getVariableFromRowElements(row: VariableRowElements) {
    return {
      Name: row.NameField.getAttribute("current-value") || "",
      Type: parseInt(row.TypeField.getAttribute("current-value") || "0"),
      Value: row.ValueField.getAttribute("current-value") || "",
    };
  }
}

type VariableRowElements = {
  NameField: HTMLElement;
  TypeField: HTMLElement;
  ValueField: HTMLElement;
};

/*

  <div class="setting-item-validation-message">Value must be greater than or equal to 6.</div>

  */
