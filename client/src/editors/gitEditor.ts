import type { erfData, ExtraData } from "./util";

const vscode = acquireVsCodeApi();
let content: erfData;

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

  vscode.postMessage({
    command: "test",
    text: "Success",
  });
}

function InboundMessageHandler(event: any) {
  const message = event.data;
  if (event.type === "message" && message) {
    const messageType = message.type;
    const test3 = document.body.appendChild(document.createElement("p"));
    switch (messageType) {
      case "update":
        try {
          content = <erfData>JSON.parse(message.text);
          test3.innerText = "Data: " + JSON.stringify(content);
        } catch {
          test3.innerText = "Data: failed to parse";
        }
        break;
    }
  }
}

// function InboundMessageHandler(event: any) {
//   const message = event.data;

//   switch (message.command) {
//     case "update":
//       updateContent(message.text);
//       break;
//   }
// }
// function updateContent(text: any) {
//   const testButton = document.getElementById("testButton");
//   if (testButton) {
//     testButton.textContent = "Success!";
//   }
// }

// const state: any = vscode.getState();
// if (state) {
//   updateContent(state.text);
// }
