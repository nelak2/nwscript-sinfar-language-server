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
