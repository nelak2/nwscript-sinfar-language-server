import { buildLabel, buildDiv } from "./utils";

export class nwnColorPicker extends HTMLElement {
  constructor() {
    super();

    const id = this.getAttribute("id");
    const label = this.getAttribute("label");

    if (!id || !label) {
      return;
    }

    const labelElement = buildLabel(label, id);
    labelElement.className = "vscode-input-label";

    const divColLabel = buildDiv("col-label");
    divColLabel.appendChild(labelElement);

    const textField = document.createElement("vscode-text-field");
    textField.id = id;
    textField.setAttribute("style", "width: 300px");
    const disabled = this.getAttribute("disabled");
    if (disabled === "true") {
      textField.setAttribute("disabled", "true");
    }

    const divColInput = buildDiv("col-input");
    divColInput.appendChild(textField);

    const rowDiv = buildDiv("row");
    rowDiv.appendChild(divColLabel);
    rowDiv.appendChild(divColInput);

    this.appendChild(rowDiv);
  }
}
