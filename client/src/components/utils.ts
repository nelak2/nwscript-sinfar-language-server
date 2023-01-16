import { VarType } from "./lists/index";

export function buildLabel(text: string, htmlFor: string): HTMLLabelElement {
  const label = document.createElement("label");
  label.className = "vscode-input-label";

  if (text === " ") label.innerText = "";
  else label.innerText = text + ":";
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

export function buildTextField(options: {
  id: string | undefined;
  value: string | undefined;
  style: string | undefined;
  disabled: boolean | undefined;
  maxLength: number | undefined;
  className: string | undefined;
  buttonType: ButtonType | undefined;
}): HTMLElement {
  const textField = document.createElement("vscode-text-field");

  if (options.id) textField.id = options.id;
  if (options.value) textField.setAttribute("value", options.value);
  if (options.style) textField.setAttribute("style", options.style);
  if (options.disabled) textField.setAttribute("disabled", "true");
  if (options.maxLength) textField.setAttribute("maxlength", options.maxLength.toString());
  if (options.className) textField.className = options.className;

  if (options.id !== undefined && options.buttonType !== undefined) {
    if (options.buttonType === ButtonType.GotoAndDelete) {
      textField.appendChild(buildTextFieldButton(options.id + "_goto", ButtonType.goto));
      textField.appendChild(buildTextFieldButton(options.id + "_del", ButtonType.delete));
    } else {
      textField.appendChild(buildTextFieldButton(options.id, options.buttonType));
    }
  }

  return textField;
}

function buildTextFieldButton(id: string, type: ButtonType): HTMLElement {
  let className = "codicon codicon-";
  let ariaLabel = "";

  switch (type) {
    case ButtonType.goto: {
      className += "go-to-file";
      ariaLabel = "Goto File";
      break;
    }
    case ButtonType.delete: {
      className += "trash";
      ariaLabel = "Delete";
      break;
    }
    case ButtonType.add: {
      className += "add";
      ariaLabel = "Add";
      break;
    }
  }

  const span = document.createElement("span");
  span.className = "codicon codicon-" + className;

  const button = document.createElement("vscode-button");
  button.id = id + "_btn";
  button.setAttribute("appearance", "icon");
  button.setAttribute("aria-label", ariaLabel);
  button.appendChild(span);

  const section = document.createElement("section");
  section.setAttribute("slot", "end");
  section.setAttribute("style", "display:flex; align-items: center;");
  section.appendChild(button);

  return section;
}

export enum ButtonType {
  "goto",
  "delete",
  "add",
  "GotoAndDelete",
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

export function buildTextAreaField(
  id: string,
  options: {
    cols: number | undefined;
    rows: number | undefined;
    style: string | undefined;
    resize: string | undefined;
  },
): HTMLElement {
  const textField = document.createElement("vscode-text-area");
  textField.id = id;

  if (options.cols) textField.setAttribute("cols", options.cols.toString());
  if (options.rows) textField.setAttribute("rows", options.rows.toString());
  if (options.style) textField.setAttribute("style", options.style);
  if (options.resize) textField.setAttribute("resize", options.resize);
  return textField;
}

export function buildLabelColumn(text: string, htmlFor: string): HTMLDivElement {
  const label = buildLabel(text, htmlFor);
  const labelDiv = buildDiv("col-label");
  labelDiv.appendChild(label);
  return labelDiv;
}
