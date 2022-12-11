import { buildLabel, buildDiv } from "./utils";

export class nwnScriptEvents extends HTMLElement {
  constructor() {
    super();

    const resType = this.getAttribute("resourcetype");

    if (!resType) {
      return;
    }

    const fieldList = events.find((e) => e.resource === resType)?.events;

    if (!fieldList) {
      return;
    }

    for (const field of fieldList) {
      const label = buildLabel(field, field + "_text");
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
    button.id = id + "_button";
    button.setAttribute("appearance", "icon");
    button.setAttribute("aria-label", "Goto File");
    button.appendChild(span);

    const section = document.createElement("section");
    section.setAttribute("slot", "end");
    section.setAttribute("style", "display:flex; align-items: center;");
    section.appendChild(button);

    const textField = document.createElement("vscode-text-field");
    textField.id = id + "_text";
    textField.appendChild(section);

    return textField;
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

const events = [
  {
    resource: "git",
    events: ["OnEnter", "OnExit", "OnHeartBeat", "OnUserDefined"],
  },
];
