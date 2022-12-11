import "@spectrum-web-components/slider/sp-slider.js";
import "@spectrum-web-components/slider/sync/sp-slider.js";
import "@spectrum-web-components/accordion/sp-accordion.js";
import "@spectrum-web-components/accordion/sp-accordion-item.js";
// import "@spectrum-web-components/color-area/sp-color-area.js";
// import "@spectrum-web-components/color-slider/sp-color-slider.js";
// import "@spectrum-web-components/popover/sp-popover.js";
// import "@spectrum-web-components/overlay/sync/overlay-trigger.js";
// import "@spectrum-web-components/button/sp-button.js";
// import "@spectrum-web-components/button/sp-clear-button.js";
// import "@spectrum-web-components/button/sp-close-button.js";

import { nwnScriptEvents } from "../../components/nwnScriptEvents";
import { nwnVolumeSlider } from "../../components/nwnVolumeSlider";
import { nwnTextField } from "../../components/nwnTextField";
import { nwnNumberField } from "../../components/nwnNumberField";
import { nwnColorPicker } from "../../components/nwnColorPicker";

const vscode = acquireVsCodeApi();

let content;

customElements.define("nwn-script-events", nwnScriptEvents);
customElements.define("nwn-volume-slider", nwnVolumeSlider);
customElements.define("nwn-text-field", nwnTextField);
customElements.define("nwn-number-field", nwnNumberField);
customElements.define("nwn-color-picker", nwnColorPicker);

window.addEventListener("load", main);
window.addEventListener("message", InboundMessageHandler);

function main() {
  // requestScriptFields("git");
  const testButton = document.getElementById("testButton");
  if (testButton) {
    testButton.addEventListener("click", handleTestClick);
  }
}

// function requestScriptFields(resourceType: string) {
//   vscode.postMessage({ command: "getScriptFields", text: resourceType });
//   console.log("requestScriptFields");
// }

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
      // case "scriptFields":
      //   generateScriptFields(message.scriptFields);
      //   break;
    }
  }
}
