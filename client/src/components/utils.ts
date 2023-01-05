import { VarType } from "./lists/index";

export function buildLabel(text: string, htmlFor: string): HTMLLabelElement {
  const label = document.createElement("label");
  label.className = "vscode-input-label";
  label.innerText = text + ":";
  label.htmlFor = htmlFor;
  return label;
}

export function buildDiv(className: string): HTMLDivElement {
  const div = document.createElement("div");
  div.className = className;
  return div;
}

// Build icon buttons using vscode codicons
export function buildButton(type: string, id: string = ""): HTMLElement {
  const button = document.createElement("vscode-button");
  button.id = id;
  button.setAttribute("appearance", "icon");
  button.setAttribute("aria-label", type);

  const span = document.createElement("span");
  span.id = id;
  span.className = "codicon codicon-" + type;
  button.appendChild(span);

  return button;
}

export function buildTextField(value: string, fieldId: string = ""): HTMLElement {
  const textField = document.createElement("vscode-text-field");
  textField.id = fieldId;
  textField.className = "variableField";
  textField.setAttribute("value", value);
  return textField;
}

export function buildDropdown(value: string, fieldId: string = ""): HTMLElement {
  const dropdown = document.createElement("vscode-dropdown");
  dropdown.id = fieldId;
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
