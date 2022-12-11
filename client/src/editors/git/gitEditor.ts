import "@spectrum-web-components/slider/sp-slider.js";
import "@spectrum-web-components/slider/sync/sp-slider.js";
import "@spectrum-web-components/accordion/sp-accordion.js";
import "@spectrum-web-components/accordion/sp-accordion-item.js";

const vscode = acquireVsCodeApi();

let content;
let scriptFields;

window.addEventListener("load", main);
window.addEventListener("message", InboundMessageHandler);

function main() {
  requestScriptFields("git");
  const testButton = document.getElementById("testButton");
  if (testButton) {
    testButton.addEventListener("click", handleTestClick);
  }
}

function requestScriptFields(resourceType: string) {
  vscode.postMessage({ command: "getScriptFields", text: resourceType });
  console.log("requestScriptFields");
}

function generateScriptFields(fieldList: string[]) {
  const scriptFieldDiv = document.getElementById("eventScripts");

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

function buildScriptTextField(id: string): HTMLElement {
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

function buildLabel(text: string, htmlFor: string): HTMLLabelElement {
  const label = document.createElement("label");
  label.className = "vscode-input-label";
  label.innerText = text;
  label.htmlFor = htmlFor;
  return label;
}

function buildDiv(className: string): HTMLDivElement {
  const div = document.createElement("div");
  div.className = className;
  return div;
}

function handleTestClick() {
  // const state: any = vscode.getState();
  const testButton = document.getElementById("testButton");
  if (testButton) {
    testButton.textContent = "Aha!";
  }
  vscode.postMessage({
    command: "getScriptFields",
    text: "git",
  });
}

// let content: any;
function InboundMessageHandler(event: any) {
  const message = event.data;
  if (event.type === "message" && message) {
    const messageType = message.type;
    const test3 = document.body.appendChild(document.createElement("p"));
    switch (messageType) {
      case "update":
        try {
          content = JSON.parse(message.text);
          test3.innerText = "Data: " + JSON.stringify(content);
        } catch {
          test3.innerText = "Data: failed to parse";
        }
        break;
      case "scriptFields":
        try {
          console.log(JSON.stringify(message.text));
          scriptFields = JSON.parse(message.text);
          //generateScriptFields(JSON.parse(message.text));
        } catch {}
    }
  }
}
