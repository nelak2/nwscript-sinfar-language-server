import { InitializeNWNControls, nwnScriptEvents } from "../../components";
import { nwnVariables } from "../../components/nwnVariables";

const vscode = acquireVsCodeApi();
InitializeNWNControls();

let content: any;
let initialized = false;

window.addEventListener("load", main);
window.addEventListener("message", InboundMessageHandler);
window.addEventListener("alert", (e: Event) => {
  const message = (e as CustomEvent).detail;
  vscode.postMessage({ type: "alert", message });
});

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
  const fieldtype = (<string>e.target.id).substring(0, 3);
  const field = (<string>e.target.id).substring(4);
  const newValue = e.target.value;

  const testp = document.body.appendChild(document.createElement("p"));

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  console.log(`Event on Field: ${field} New Value: ${newValue} Field Type: ${fieldtype}`);
  // console.log(e);

  try {
    switch (fieldtype) {
      case "res": {
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
          testp.innerText = `SENT Field: ${field} Old: ${oldValue} New: ${newValue}`;
        }
        break;
      }
      case "evt": {
        const oldValue = content.resData[1][field][1];
        content.resData[1][field][1] = newValue;

        if (e) {
          vscode.postMessage({
            type: "update",
            field,
            newValue,
            oldValue,
          });

          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/restrict-template-expressions
          testp.innerText = `SENT Field: ${field} Old: ${oldValue} New: ${newValue}`;
        }
        break;
      }
      case "var": {
        const varTable = <nwnVariables>document.getElementById("VarTable");
        if (!varTable) {
          console.log("No VarTable found!");
          return;
        }

        const varTableUpdateType = (<string>e.target.id).split("_")[1];
        console.log(`VarTable Update Type: ${varTableUpdateType}`);

        switch (varTableUpdateType) {
          case "name": {
            console.log("Update Name");
            break;
          }
          case "type": {
            console.log("Update Type");
            break;
          }
          case "value": {
            console.log("Update Value");
            break;
          }
          case "add": {
            console.log("Add Variable");
            break;
          }
          case "del": {
            console.log("Delete Variable");
            break;
          }
        }

        const oldValue = content.resData[1].VarTable;
        const newVarTable = varTable.getVarTable();
        content.resData[1].VarTable = newVarTable;

        vscode.postMessage({
          type: "update_var_table",
          field,
          newVarTable,
          oldValue,
        });
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/restrict-template-expressions
        testp.innerText = `SENT VarTable: ${newVarTable} Old: ${oldValue}`;

        break;
      }
    }
  } catch {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/restrict-template-expressions
    testp.innerText = `ERROR: Field: ${field} New: ${newValue}`;
    console.log(content.resData);
  }
}

function InboundMessageHandler(event: any) {
  const message = event.data;
  if (event.type === "message" && message) {
    const messageType = message.type;
    const test3 = document.body.appendChild(document.createElement("p"));
    switch (messageType) {
      case "init":
        test3.innerText = ("INIT:" + JSON.stringify(message)).substring(0, 100);
        content = message.content;
        InitHTMLElements();

        if (message.edits) {
          for (const edit of message.edits) {
            const test4 = document.body.appendChild(document.createElement("p"));
            UpdateHTMLElementValue(edit.field, edit.newValue);
            test4.innerText = ("UPDATE RECEIVED:" + JSON.stringify(edit)).substring(0, 100);
          }
        }

        if (!initialized) {
          BindListeners();
        }
        break;
      case "update":
        content.resData[1].AreaProperties[1][1][message.field][1] = message.newValue;
        UpdateHTMLElementValue(message.field, message.newValue);
        test3.innerText = "UPDATE RECEIVED:" + JSON.stringify(message);
        break;
      case "getFileData": {
        const test4 = document.body.appendChild(document.createElement("p"));
        test4.innerText = "SENT getFileData:" + JSON.stringify(message).substring(0, 100);
        getFileData(message.requestId);
        break;
      }
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

function getFileData(requestId: number = -1) {
  const editableFields = content.extraData.editableFields;
  for (const field of editableFields) {
    const element = document.getElementById("res_" + <string>field);

    if (!element) {
      console.log("Element not found: " + <string>field);
      return;
    }

    if (element.tagName.startsWith("VSCODE")) {
      content.resData[1].AreaProperties[1][1][field][1] = element.getAttribute("current-value");
    } else if (element.tagName.startsWith("SP")) {
      content.resData[1].AreaProperties[1][1][field][1] = element.getAttribute("value");
    }
  }
  const varTableElement = <nwnVariables>document.getElementById("VarTable");
  if (!varTableElement) {
    console.log("Element not found: VarTable");
    return;
  }

  const varTable = varTableElement.getVarTable();
  content.resData[1].VarTable = varTable;

  console.log(content);

  vscode.postMessage({
    type: "getFileData",
    content,
    requestId,
  });
}

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

  // Bind the script event fields
  const scriptEventElement = document.getElementById("ScriptEvents");
  if (scriptEventElement && scriptEventElement instanceof nwnScriptEvents) {
    scriptEventElement.onTextFieldChanged(onEditableFieldChange);
  }
  // Bind the variable table
  const varTableElement = document.getElementById("VarTable");
  if (varTableElement) {
    varTableElement.addEventListener("change", onEditableFieldChange);
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
  document.getElementById("VarTable")?.setAttribute("current-value", JSON.stringify(varTable));
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
