import { buildLabel, buildDiv } from "./utils";

export class nwnTextField extends HTMLElement {
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

// <div class="row">
// <div class="col-label">
//   <label class="vscode-input-label" for="res_input_Name">Name:</label>
// </div>
// <div class="col-input">
//   <vscode-text-field style="width: 300px" id="res_input_Name"></vscode-text-field>
// </div>
// </div>
