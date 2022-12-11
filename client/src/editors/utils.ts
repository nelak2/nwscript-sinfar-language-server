export type erfData = {
  resName: string;
  erfId: number;
  resData: any[];
  langId: string;
  resResRef: string;
  editableFields: any[];
  extraData: ExtraData;
};

export type ExtraData = {
  editableFields: string[];
};

export function generateScriptFields(fieldList: string[]) {
  const scriptFieldDiv = document.getElementById("eventScripts");

  console.log(scriptFieldDiv);
  console.log(fieldList);

  if (scriptFieldDiv && fieldList) {
    for (const field of fieldList) {
      const label = buildLabel(field, field + "_text");
      const divColLabel = buildDiv("col-label");
      divColLabel.appendChild(label);

      const textField = buildScriptTextField(field);
      const divColInput = buildDiv("col-input");
      divColInput.appendChild(textField);

      const rowDiv = buildDiv("row");
      rowDiv.appendChild(divColLabel);
      rowDiv.appendChild(divColInput);

      scriptFieldDiv.appendChild(rowDiv);
    }
  }
}

export function buildScriptTextField(id: string): HTMLElement {
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
