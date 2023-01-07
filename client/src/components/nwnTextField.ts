import { buildLabel, buildDiv } from "./utils";

export class nwnTextField extends HTMLElement {
  constructor() {
    super();

    const id = this.getAttribute("id");
    // Clear the id so that the div doesn't match the id of the field
    this.setAttribute("id", "");
    const label = this.getAttribute("label");
    const type = this.getAttribute("type");

    if (!id || !label) {
      return;
    }

    const labelElement = buildLabel(label, id);
    labelElement.className = "vscode-input-label";

    const divColLabel = buildDiv("col-label");
    divColLabel.appendChild(labelElement);

    let textField: HTMLElement;
    switch (type) {
      case "script": {
        textField = this.buildScriptTextField(id);
        break;
      }
      default: {
        textField = this.buildBasicTextField(id);
      }
    }

    const divColInput = buildDiv("col-input");
    divColInput.appendChild(textField);

    const rowDiv = buildDiv("row");
    rowDiv.appendChild(divColLabel);
    rowDiv.appendChild(divColInput);

    this.appendChild(rowDiv);
  }

  buildScriptTextField(id: string): HTMLElement {
    const span = document.createElement("span");
    span.className = "codicon codicon-go-to-file";

    const button = document.createElement("vscode-button");
    button.id = id + "_btn";
    button.setAttribute("appearance", "icon");
    button.setAttribute("aria-label", "Goto File");
    button.appendChild(span);

    const section = document.createElement("section");
    section.setAttribute("slot", "end");
    section.setAttribute("style", "display:flex; align-items: center;");
    section.appendChild(button);

    const textField = document.createElement("vscode-text-field");
    textField.id = id;
    textField.appendChild(section);

    return textField;
  }

  buildBasicTextField(id: string): HTMLElement {
    const textField = document.createElement("vscode-text-field");
    textField.id = id;
    textField.setAttribute("style", "width: 300px");
    const disabled = this.getAttribute("disabled");
    if (disabled === "true") {
      textField.setAttribute("disabled", "true");
    }
    return textField;
  }
}
