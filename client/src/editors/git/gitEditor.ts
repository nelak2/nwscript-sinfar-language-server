import { InitializeNWNControls } from "../../components";
import { nwnVariables } from "../../components/nwnVariables";

const vscode = acquireVsCodeApi();
InitializeNWNControls();

let content: any;
let initialized = false;

window.addEventListener("load", main);
// window.addEventListener("save", save);
window.addEventListener("message", InboundMessageHandler);

function main() {
  // requestScriptFields("git");
  // const testButton = document.getElementById("testButton");
  // if (testButton) {
  //   testButton.addEventListener("click", handleTestClick);
  // }

  // const saveButton = document.getElementById("saveButton");
  // if (saveButton) {
  //   saveButton.addEventListener("click", save);
  // }

  // let vscode know that we are ready
  vscode.postMessage({ type: "ready" });
}

function onEditableFieldChange(e: any) {
  const field = (<string>e.target.id).substring(4);
  const newValue = e.target.value;

  const testp = document.body.appendChild(document.createElement("p"));
  try {
    const oldValue = content.resData[1].AreaProperties[1][1][field][1];
    content.resData[1].AreaProperties[1][1][field][1] = newValue;

    if (e) {
      vscode.postMessage({
        type: "update",
        field,
        newValue,
        oldValue,
      });

      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/restrict-template-expressions
      testp.innerText = `Field: ${field} Old: ${oldValue} New: ${newValue}`;
    }
  } catch {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/restrict-template-expressions
    testp.innerText = `ERROR: Field: ${field} New: ${newValue}`;
  }
}

function InboundMessageHandler(event: any) {
  const message = event.data;
  if (event.type === "message" && message) {
    const messageType = message.type;
    const test3 = document.body.appendChild(document.createElement("p"));
    switch (messageType) {
      case "init":
        test3.innerText = "UPDATE RECEIVED:" + JSON.stringify(message);
        content = message.content;
        InitHTMLElements();

        if (!initialized) {
          BindListeners();
        }
        break;
      case "update":
        content.resData[1].AreaProperties[1][1][message.field][1] = message.newValue;
        UpdateHTMLElementValue(message.field, message.newValue);
        test3.innerText = "UPDATE RECEIVED:" + JSON.stringify(message);
        break;
    }
  }
}

function UpdateHTMLElementValue(field: string, newValue: string) {
  const element = document.getElementById("res_" + field);

  if (element) {
    // Make sure the event listener doesn't fire when we update the value and create an infinite loop
    element.removeEventListener("change", onEditableFieldChange);

    if (element.tagName.startsWith("VSCODE")) {
      element.setAttribute("current-value", newValue);
    } else if (element.tagName.startsWith("SP")) {
      element.setAttribute("value", newValue);
    }

    // Rebind the event listener
    element.addEventListener("change", onEditableFieldChange);
  } else {
    console.log("Element not found: " + field);
  }
}

// function save() {
//   const editableFields = content.extraData.editableFields;
//   for (const field of editableFields) {
//     const element = document.getElementById("res_" + <string>field);

//     if (!element) {
//       console.log("Element not found: " + <string>field);
//       return;
//     }

//     if (element.tagName.startsWith("VSCODE")) {
//       content.resData[1].AreaProperties[1][1][field][1] = element.getAttribute("current-value");
//     } else if (element.tagName.startsWith("SP")) {
//       content.resData[1].AreaProperties[1][1][field][1] = element.getAttribute("value");
//     }
//   }
//   const varTableElement = <nwnVariables>document.getElementById("res_variableTable");
//   if (!varTableElement) {
//     console.log("Element not found: res_variableTable");
//   }

//   const varTable = varTableElement.getVarTable();
//   content.resData[1].VarTable = varTable;

//   console.log(content);

//   vscode.postMessage({
//     command: "type",
//     text: JSON.stringify(content),
//   });
// }

function BindListeners() {
  const editableFields = content.extraData.editableFields;
  for (const field of editableFields) {
    const element = document.getElementById("res_" + <string>field);

    if (!element) {
      console.log("Element not found: " + <string>field);
      return;
    }

    element.addEventListener("change", onEditableFieldChange);
  }
  initialized = true;
}

function InitHTMLElements() {
  // Set simple fields
  const editableFields = content.extraData.editableFields;
  for (const field of editableFields) {
    UpdateHTMLElementValue(field, content.resData[1].AreaProperties[1][1][field][1]);
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
