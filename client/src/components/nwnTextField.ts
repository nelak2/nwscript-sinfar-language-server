import { buildLabel, buildDiv, buildTextAreaField, buildTextField, ButtonType } from "./utils";

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
      const comment = buildTextAreaField(id, {
        cols: 70,
        rows: 10,
        resize: "vertical",
        style: undefined,
      });
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
      case "resref":
      case "creature": {
        textField = this.buildResrefTextField(id);
        break;
      }
      case "textarea": {
        textField = buildTextAreaField(id, {
          cols: undefined,
          rows: 6,
          style: "width: 300px",
          resize: "vertical",
        });
        break;
      }
      default: {
        let disabled: boolean = false;
        if (this.getAttribute("disabled") === "true") {
          disabled = true;
        }

        textField = buildTextField({
          id,
          style: "width: 300px",
          disabled,
          maxLength: undefined,
          className: undefined,
          value: undefined,
          buttonType: undefined,
        });
      }
    }

    const divColInput = buildDiv("col-input");
    divColInput.appendChild(textField);

    const rowDiv = buildDiv("row");
    rowDiv.appendChild(divColLabel);
    rowDiv.appendChild(divColInput);

    this.appendChild(rowDiv);
  }

  buildResrefTextField(id: string): HTMLElement {
    return buildTextField({
      id,
      style: "width: 300px",
      disabled: false,
      maxLength: 16,
      className: undefined,
      value: undefined,
      buttonType: ButtonType.goto,
    });
  }
}
