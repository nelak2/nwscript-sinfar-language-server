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

// Build icon buttons using vscode codicons
export function buildButton(type: string): HTMLElement {
  const button = document.createElement("vscode-button");
  button.setAttribute("appearance", "icon");
  button.setAttribute("aria-label", type);

  const span = document.createElement("span");
  span.className = "codicon codicon-" + type;
  button.appendChild(span);

  return button;
}
