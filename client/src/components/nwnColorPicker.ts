import { buildLabel, buildDiv } from "./utils";

export class nwnColorPicker extends HTMLElement {
  constructor() {
    super();

    const id = this.getAttribute("id");
    // Clear the id so that the div doesn't match the id of the field
    this.setAttribute("id", "");
    const label = this.getAttribute("label");

    if (!id || !label) {
      return;
    }

    const labelElement = buildLabel(label, id);
    labelElement.className = "vscode-input-label";

    const divColLabel = buildDiv("col-label");
    divColLabel.appendChild(labelElement);

    const textField = this.buildColorPicker(id);

    const divColInput = buildDiv("col-input");
    divColInput.appendChild(textField);

    const rowDiv = buildDiv("row");
    rowDiv.appendChild(divColLabel);
    rowDiv.appendChild(divColInput);

    this.appendChild(rowDiv);
  }

  private buildTextField(id: string): HTMLElement {
    const textField = document.createElement("vscode-text-field");
    textField.id = id;
    textField.setAttribute("style", "width: 300px");
    const disabled = this.getAttribute("disabled");
    if (disabled === "true") {
      textField.setAttribute("disabled", "true");
    }
    return textField;
  }

  private buildColorPicker(id: string): HTMLElement {
    const colorPicker = document.createElement("input");
    colorPicker.id = id;
    colorPicker.setAttribute("type", "color");
    colorPicker.setAttribute("name", id);
    colorPicker.setAttribute("style", "width: 100px; background-color: var(--vscode-input-background);");
    return colorPicker;
  }
}
