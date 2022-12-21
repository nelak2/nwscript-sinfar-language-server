import { buildLabel, buildDiv } from "./utils";
import { scriptEvents } from "./lists/scriptevents";

export class nwnScriptEvents extends HTMLElement {
  private readonly _fields: Array<HTMLElement> = [];
  private readonly _buttons: Array<HTMLElement> = [];
  prefix = "evt_";

  constructor() {
    super();

    const resType = this.getAttribute("resourcetype");

    if (!resType) {
      return;
    }

    const fieldList = scriptEvents.find((e) => e.resource === resType)?.events;

    if (!fieldList) {
      return;
    }

    for (const field of fieldList) {
      const label = buildLabel(field, this.prefix + field);
      const divColLabel = buildDiv("col-label");
      divColLabel.appendChild(label);

      const textField = this.buildScriptTextField(field);
      const divColInput = buildDiv("col-input");
      divColInput.appendChild(textField);

      const rowDiv = buildDiv("row");
      rowDiv.appendChild(divColLabel);
      rowDiv.appendChild(divColInput);

      this.appendChild(rowDiv);
    }
  }

  buildScriptTextField(id: string): HTMLElement {
    const span = document.createElement("span");
    span.className = "codicon codicon-go-to-file";

    const button = document.createElement("vscode-button");
    button.id = this.prefix + id + "_btn";
    button.setAttribute("appearance", "icon");
    button.setAttribute("aria-label", "Goto File");
    button.appendChild(span);

    const section = document.createElement("section");
    section.setAttribute("slot", "end");
    section.setAttribute("style", "display:flex; align-items: center;");
    section.appendChild(button);

    const textField = document.createElement("vscode-text-field");
    textField.id = this.prefix + id;
    textField.appendChild(section);

    this._fields.push(textField);
    this._buttons.push(button);

    return textField;
  }

  public onTextFieldChanged(listener: (e: any) => void) {
    for (const field of this._fields) {
      field.addEventListener("change", listener);
    }
  }

  public onGotoButtonClicked(listener: (e: any) => void) {
    for (const button of this._buttons) {
      button.addEventListener("click", listener);
    }
  }

  get resourceType() {
    return this.getAttribute("resourceType");
  }

  set resourceType(value) {
    if (value) {
      this.setAttribute("resourceType", value);
    } else {
      this.removeAttribute("resourceType");
    }
  }
}
