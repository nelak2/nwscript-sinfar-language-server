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

        const varFieldFullId = (<string>e.target.id).split("_");
        const varTableUpdateType = varFieldFullId[1];
        const varFieldId = varFieldFullId[2];

        let newVarTable: any;
        let oldValue: any;

        if (varTableUpdateType === "name") {
          oldValue = content.resData[1].VarTable[1][varFieldId][1].Name[1];
          content.resData[1].VarTable[1][varFieldId][1].Name[1] = newValue;
        } else if (varTableUpdateType === "type") {
          oldValue = content.resData[1].VarTable[1][varFieldId][1].Type[1];
          content.resData[1].VarTable[1][varFieldId][1].Type[1] = newValue;
        } else if (varTableUpdateType === "value") {
          oldValue = content.resData[1].VarTable[1][varFieldId][1].Value[1];
          content.resData[1].VarTable[1][varFieldId][1].Value[1] = newValue;
        } else if (varTableUpdateType === "add" || varTableUpdateType === "del") {
          oldValue = content.resData[1].VarTable;

          newVarTable = varTable.getVarTable();
          content.resData[1].VarTable = newVarTable;
        }

        if (varTableUpdateType === "name" || varTableUpdateType === "type" || varTableUpdateType === "value") {
          // Don't send update if nothing changed
          if (newValue.toString() === oldValue.toString()) {
            return;
          }

          vscode.postMessage({
            type: "update",
            field: e.target.id,
            newValue,
            oldValue,
          });
        } else if (varTableUpdateType === "add" || varTableUpdateType === "del") {
          vscode.postMessage({
            type: "update",
            field: "var_adddel",
            newValue: newVarTable,
            oldValue,
          });
        }
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/restrict-template-expressions
        testp.innerText = `SENT VarTable: ${newVarTable} Old: ${oldValue}`;

        break;
      }
    }
  } catch (e: any) {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, @typescript-eslint/restrict-template-expressions
    testp.innerText = `ERROR: Field: ${field} New: ${newValue}`;
    console.log(e);
  }
}

function InboundMessageHandler(event: any) {
  const message = event.data;
  if (event.type === "message" && message) {
    const messageType = message.type;
    const test3 = document.body.appendChild(document.createElement("p"));

    if (messageType === "update" || messageType === "undo" || messageType === "redo") {
      const updateType = message.field.split("_")[0];

      if (updateType === "var") {
        UpdateVarTable(message.field, message.newValue);
      } else if (updateType === "evt") {
        UpdateEventTable(message.field, message.newValue);
      } else {
        content.resData[1].AreaProperties[1][1][message.field][1] = message.newValue;
        UpdateHTMLElementValue(message.field, message.newValue);
      }

      test3.innerText = "UPDATE RECEIVED:" + JSON.stringify(message);
    } else if (messageType === "init") {
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
    } else if (messageType === "getFileData") {
      const test4 = document.body.appendChild(document.createElement("p"));
      test4.innerText = "SENT getFileData:" + JSON.stringify(message).substring(0, 100);
      getFileData(message.requestId);
    }
  }
}

function UpdateVarTable(field: string, newValue: any) {
  const varFieldFullId = field.split("_");
  const varTableUpdateType = varFieldFullId[1];
  const varFieldId = varFieldFullId[2];

  // get reference to var table
  const varTable = <nwnVariables>document.getElementById("VarTable");

  // update content
  if (varTableUpdateType === "name") {
    content.resData[1].VarTable[1][varFieldId][1].Name[1] = newValue;
  } else if (varTableUpdateType === "type") {
    content.resData[1].VarTable[1][varFieldId][1].Type[1] = newValue;
  } else if (varTableUpdateType === "value") {
    content.resData[1].VarTable[1][varFieldId][1].Value[1] = newValue;
  } else if (varTableUpdateType === "adddel") {
    content.resData[1].VarTable = newValue;
  }

  // update var table
  if (varTableUpdateType === "name" || varTableUpdateType === "type" || varTableUpdateType === "value") {
    varTable.updateVarTable(parseInt(varFieldId), varTableUpdateType, newValue);
  } else if (varTableUpdateType === "adddel") {
    varTable.SetVarTable(newValue);
  }
}

function UpdateEventTable(field: string, newValue: any) {}

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
      continue;
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
