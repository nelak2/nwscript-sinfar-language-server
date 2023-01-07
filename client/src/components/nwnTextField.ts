import { buildLabel, buildDiv } from "./utils";

export class nwnTextField extends HTMLElement {
  constructor() {
    super();

    const id = this.getAttribute("id");
    // Clear the id so that the div doesn't match the id of the field
    this.setAttribute("id", "");
    const label = this.getAttribute("label");
    const type = this.getAttribute("type");

    if (!id) return;

    if (type === "comment") {
      const comment = this.buildCommentField(id);
      this.appendChild(comment);
      return;
    }

    if (!label) return;

    const labelElement = buildLabel(label, id);
    labelElement.className = "vscode-input-label";

    const divColLabel = buildDiv("col-label");
    divColLabel.appendChild(labelElement);

    let textField: HTMLElement;
    switch (type) {
      case "script":
      case "dialog":
      case "item":
      case "creature": {
        textField = this.buildResrefTextField(id);
        break;
      }
      case "textarea": {
        textField = this.buildTextAreaField(id);
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

  buildCommentField(id: string): HTMLElement {
    const comment = document.createElement("vscode-text-area");
    comment.id = id;
    comment.setAttribute("cols", "70");
    comment.setAttribute("rows", "10");
    comment.setAttribute("resize", "vertical");
    return comment;
  }

  buildTextAreaField(id: string): HTMLElement {
    const textField = document.createElement("vscode-text-area");
    textField.id = id;
    textField.setAttribute("style", "width: 300px");
    textField.setAttribute("rows", "6");
    textField.setAttribute("resize", "vertical");
    return textField;
  }

  buildResrefTextField(id: string): HTMLElement {
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
    textField.setAttribute("maxlength", "16");
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
