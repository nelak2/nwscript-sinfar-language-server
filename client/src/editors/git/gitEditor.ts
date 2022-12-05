import { erfData } from "../util";
import { NumberField } from "../components/numberField";
import {
  fastNumberField,
  provideFASTDesignSystem,
  controlCornerRadius,
  fillColor,
  accentColor,
  neutralColor,
  typeRampBaseFontSize,
  typeRampBaseLineHeight,
  SwatchRGB,
} from "@microsoft/fast-components";
import { numberFieldStyles } from "../components/numberField/number-field.styles";
import * as VSCODE_TOKEN from "../components/design-tokens";

const vscode = acquireVsCodeApi();

let content;

window.addEventListener("load", main);
window.addEventListener("message", InboundMessageHandler);

function main() {
  const testButton = document.getElementById("testButton");
  if (testButton) {
    testButton.addEventListener("click", handleTestClick);
  }

  applyCurrentTheme();

  provideFASTDesignSystem().register(fastNumberField());

  // const myElement = document.querySelector("fast-number-field") as HTMLElement;
  // typeRampBaseFontSize.setValueFor(myElement, "20px");
}

function applyCurrentTheme() {
  controlCornerRadius.withDefault(0);
  fillColor.withDefault(SwatchRGB.create(30, 30, 30));
  neutralColor.withDefault(SwatchRGB.create(204, 204, 204));
  accentColor.withDefault(SwatchRGB.create(111, 195, 223));
  typeRampBaseFontSize.withDefault("13px");
  typeRampBaseLineHeight.withDefault("normal");
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
