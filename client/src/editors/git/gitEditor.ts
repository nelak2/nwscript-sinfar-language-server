import { InitializeNWNControls } from "../../components";

const vscode = acquireVsCodeApi();
InitializeNWNControls();

let content;

window.addEventListener("load", main);
window.addEventListener("save", save);
window.addEventListener("message", InboundMessageHandler);

function main() {
  // requestScriptFields("git");
  const testButton = document.getElementById("testButton");
  if (testButton) {
    testButton.addEventListener("click", handleTestClick);
  }
}

function save() {}

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
          LoadValues(content);
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

function LoadValues(content: any) {
  // Set simple fields
  const editableFields = content.extraData.editableFields;
  for (const field of editableFields) {
    const element = document.getElementById("res_" + <string>field);

    if (!element) {
      console.log("Element not found: " + <string>field);
      return;
    }

    if (element.tagName.startsWith("VSCODE")) {
      element.setAttribute("current-value", content.resData[1].AreaProperties[1][1][field][1]);
    } else if (element.tagName.startsWith("SP")) {
      element.setAttribute("value", content.resData[1].AreaProperties[1][1][field][1]);
    } else if (element.tagName.startsWith("NWN")) {
      element.setAttribute("current-value", content.resData[1].AreaProperties[1][1][field][1]);
    } else {
      element.setAttribute("value", content.resData[1].AreaProperties[1][1][field][1]);
    }
  }

  // Set variable table
  const varTable = content.resData[1].VarTable[1];
  document.getElementById("res_variableTable")?.setAttribute("current-value", JSON.stringify(varTable));
}

// res_AmbientSndDay
// res_AmbientSndDayVol
// res_MusicDay
// res_AmbientSndNight
// res_AmbientSndNightVol
// res_MusicNight
// res_MusicBattle
// res_MusicDelay
// res_EnvAudio
// SCRIPTS

// res_Name
// res_Tag
// res_TilesetResRef
// res_Size
// res_DayNightCycle
// res_Flags_SunShadows
// res_Flags_MoonShadows
// res_SunAmbientColor
// res_SunDiffuseColor
// res_SunFogAmount
// res_SunFogColor
// res_MoonAmbientColor
// res_MoonDiffuseColor
// res_MoonFogAmount
// res_MoonFogColor
// res_FogClipDistance
// res_ShadowOp
// res_ShadowOpacity
// res_WeatherWindPower
// res_WeatherSnowPercentage
// res_WeatherRainPercentage
// res_WeatherLightningPercentage
// res_Skybox
// res_Flags_NoRest
// res_Flags_Interior
// res_Flags_Underground
// res_Flags_Natural
// res_CheckModifierListen
// res_CheckModifierSpot
// res_PvP
// res_LoadScreen

// VARIABLES
