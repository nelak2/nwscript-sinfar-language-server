import { erfData } from "../util";
import { NumberField } from "../components/numberField";
import { fastNumberField, provideFASTDesignSystem } from "@microsoft/fast-components";
import { numberFieldStyles } from "../components/numberField/number-field.styles";

const vscode = acquireVsCodeApi();

provideFASTDesignSystem().register(
  fastNumberField({
    styles: numberFieldStyles.toString(),
  }),
);

let content;

window.addEventListener("load", main);
window.addEventListener("message", InboundMessageHandler);

function main() {
  const testButton = document.getElementById("testButton");
  if (testButton) {
    testButton.addEventListener("click", handleTestClick);
  }
}

function handleTestClick() {
  // const state: any = vscode.getState();
  const testButton = document.getElementById("testButton");
  if (testButton) {
    testButton.textContent = "Clicked";
  }
  // vscode.postMessage({
  //   command: "test",
  //   text: "Success",
  // });
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
    }
  }
}
