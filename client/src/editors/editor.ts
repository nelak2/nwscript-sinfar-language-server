import {
  InitializeNWNControls,
  nwnVariables,
  nwnSoundsList,
  nwnPLCInventory,
  nwnEncounterList,
  nwnMerchantRestrictions,
  nwnMerchantInventory,
  nwnItemAppearance,
  nwnItemProperties,
  nwnCreatureAppearance,
  nwnCreatureInventory,
  nwnCreatureFeats,
  nwnCreatureAbilities,
} from "../components";
import { createResData, ResData, Uts, Utp, Ute, Utm, Uti, Utc } from "../editorProviders/resData";

const vscode = acquireVsCodeApi();
InitializeNWNControls();

let content: ResData;
let initialized = false;
let _varTable: nwnVariables;
let _soundList: nwnSoundsList;
let _plcInventoryList: nwnPLCInventory;
let _encounterList: nwnEncounterList;
let _restrictionList: nwnMerchantRestrictions;
let _merchantInventory: nwnMerchantInventory;
let _itemAppearance: nwnItemAppearance;
let _itemProperties: nwnItemProperties;
let _creatureAppearance: nwnCreatureAppearance;
let _creatureInventory: nwnCreatureInventory;
let _creatureFeats: nwnCreatureFeats;
let _creatureAbilities: nwnCreatureAbilities;
// let _creatureSpells: nwnCreatureSpells;

window.addEventListener("load", main);
window.addEventListener("message", InboundMessageHandler);
window.addEventListener("alert", (e: Event) => {
  const message = (e as CustomEvent).detail;
  vscode.postMessage({ type: "alert", message });
});

function main() {
  // let vscode know that we are ready
  vscode.postMessage({ type: "ready" });
}

function onEditableFieldChange(e: any) {
  const fieldtype = (<string>e.target.id).substring(0, 3);
  const field = (<string>e.target.id).substring(4);

  try {
    switch (fieldtype) {
      case "res": {
        let newValue;
        if (e.target.tagName === "VSCODE-CHECKBOX") {
          if (e.target.checked) {
            newValue = 1;
          } else {
            newValue = 0;
          }
        } else {
          newValue = e.target.value;
        }

        const oldValue = content.getField(field);
        content.setField(field, newValue);

        if (e) {
          vscode.postMessage({
            type: "update",
            field,
            newValue,
            oldValue,
          });
        }
        break;
      }
      case "Var": {
        vscode.postMessage({
          type: "update",
          field: e.detail.field,
          newValue: e.detail.newValue,
          oldValue: e.detail.oldValue,
        });
        break;
      }
      case "Sou": {
        vscode.postMessage({
          type: "update",
          field: e.detail.field,
          newValue: e.detail.newValue,
          oldValue: e.detail.oldValue,
        });
        break;
      }
      case "PLC": {
        vscode.postMessage({
          type: "update",
          field: e.detail.field,
          newValue: e.detail.newValue,
          oldValue: e.detail.oldValue,
        });
        break;
      }
      case "Enc": {
        vscode.postMessage({
          type: "update",
          field: e.detail.field,
          newValue: e.detail.newValue,
          oldValue: e.detail.oldValue,
        });
        break;
      }
      case "Res": {
        vscode.postMessage({
          type: "update",
          field: e.detail.field,
          newValue: e.detail.newValue,
          oldValue: e.detail.oldValue,
        });
        break;
      }
      case "Mer": {
        vscode.postMessage({
          type: "update",
          field: e.detail.field,
          newValue: e.detail.newValue,
          oldValue: e.detail.oldValue,
        });
        break;
      }
      case "Ite": {
        vscode.postMessage({
          type: "update",
          field: e.detail.field,
          newValue: e.detail.newValue,
          oldValue: e.detail.oldValue,
        });
        break;
      }
      // Creature appearance
      case "CRE": {
        vscode.postMessage({
          type: "update",
          field: e.detail.field,
          newValue: e.detail.newValue,
          oldValue: e.detail.oldValue,
        });
        break;
      }
      // Feat List
      case "Fea": {
        vscode.postMessage({
          type: "update",
          field: e.detail.field,
          newValue: e.detail.newValue,
          oldValue: e.detail.oldValue,
        });
        break;
      }
      // Abilities List
      case "CRA": {
        vscode.postMessage({
          type: "update",
          field: e.detail.field,
          newValue: e.detail.newValue,
          oldValue: e.detail.oldValue,
        });
        break;
      }
    }
  } catch (e: any) {
    console.log(e);
  }
}

function InboundMessageHandler(event: any) {
  const message = event.data;
  if (event.type === "message" && message) {
    const messageType = message.type;

    // Handle update undo and redo messages
    if (messageType === "update" || messageType === "undo" || messageType === "redo") {
      ProcessUpdateMessage(message.field, message.newValue, message.oldValue);
    }
    // Handle init message
    else if (messageType === "init") {
      content = createResData(message.content);
      InitHTMLElements();

      if (message.edits) {
        for (const edit of message.edits) {
          ProcessUpdateMessage(edit.field, edit.newValue, edit.oldValue);
        }
      }

      if (!initialized) {
        BindListeners();
      }
    }
    // Handle file data message
    else if (messageType === "getFileData") {
      getFileData(message.requestId);
    }
  }
}

function ProcessUpdateMessage(field: string, newValue: any, oldValue: any) {
  const updateType = field.split("_")[0];

  if (updateType === "var") {
    UpdateVarTable(field, newValue);
  } else if (updateType === "SoundList") {
    UpdateSoundList(field, newValue, oldValue);
  } else if (updateType === "PLCInventory") {
    UpdatePLCInventoryList(field, newValue, oldValue);
  } else if (updateType === "EncounterList") {
    UpdateEncounterList(field, newValue, oldValue);
  } else if (updateType === "RestrictionList") {
    UpdateRestrictionList(field, newValue, oldValue);
  } else if (updateType === "MerchantInventory") {
    UpdateMerchantInventory(field, newValue, oldValue);
  } else if (updateType === "itm") {
    // ItemProperty
    UpdateItemProperties(field, newValue, oldValue);
  } else if (updateType === "CREInventory") {
    UpdateCREInventoryList(field, newValue, oldValue);
  } else if (updateType === "FeatList") {
    UpdateFeatList(field, newValue, oldValue);
  } else if (updateType === "CRAbilities") {
    UpdateAbilitiesList(field, newValue, oldValue);
  } else {
    content.setField(field, newValue);
    UpdateHTMLElementValue(field, newValue);

    // Handling for base item changes in the UTI editor
    // Makes sure that if the base item changes, the available options are updated
    if (updateType === "BaseItem" && _itemAppearance) {
      _itemAppearance.HandleBaseItemChange();
    }

    if (updateType === "Appearance_Type" && _creatureAppearance) {
      _creatureAppearance.HandleAppearanceChange();
    }
  }
}

function UpdateCREInventoryList(field: string, newValue: any, oldValue: any) {
  const creInventoryFieldFullId = field.split("_");
  const creInventoryFieldId = creInventoryFieldFullId[2];

  if (!_creatureInventory) return;

  // update content
  _creatureInventory.Update(parseInt(creInventoryFieldId), newValue, oldValue);
}

function UpdateItemProperties(field: string, newValue: any, oldValue: any) {
  const itemPropertyFieldFullId = field.split("_");
  const index = parseInt(itemPropertyFieldFullId[2]);

  if (!_itemProperties) return;

  // update content
  _itemProperties.Update(index, newValue, oldValue);
}

function UpdateMerchantInventory(field: string, newValue: any, oldValue: any) {
  const merchantInventoryFieldFullId = field.split("_");

  const category = parseInt(merchantInventoryFieldFullId[2]);
  const index = parseInt(merchantInventoryFieldFullId[3]);

  if (!_merchantInventory) return;

  // update content
  _merchantInventory.Update(category, index, newValue, oldValue);
}

function UpdatePLCInventoryList(field: string, newValue: any, oldValue: any) {
  const plcInventoryFieldFullId = field.split("_");
  const plcInventoryFieldId = plcInventoryFieldFullId[2];

  if (!_plcInventoryList) return;

  // update content
  _plcInventoryList.Update(parseInt(plcInventoryFieldId), newValue, oldValue);
}

function UpdateSoundList(field: string, newValue: any, oldValue: any) {
  const soundFieldFullId = field.split("_");
  const soundFieldId = soundFieldFullId[2];

  if (!_soundList) return;

  // update content
  _soundList.Update(parseInt(soundFieldId), newValue, oldValue);
}

function UpdateVarTable(field: string, newValue: any) {
  const varFieldFullId = field.split("_");
  const varFieldId = varFieldFullId[2];

  if (!_varTable) return;

  // update content
  _varTable.Update(parseInt(varFieldId), newValue);
}

function UpdateEncounterList(field: string, newValue: any, oldValue: any) {
  const encounterFieldFullId = field.split("_");
  const encounterFieldId = encounterFieldFullId[2];

  if (!_encounterList) return;

  // update content
  _encounterList.Update(parseInt(encounterFieldId), newValue, oldValue);
}

function UpdateRestrictionList(field: string, newValue: any, oldValue: any) {
  const restrictionFieldFullId = field.split("_");
  const restrictionFieldId = restrictionFieldFullId[2];

  if (!_restrictionList) return;

  // update content
  _restrictionList.Update(parseInt(restrictionFieldId), newValue, oldValue);
}

function UpdateFeatList(field: string, newValue: any, oldValue: any) {
  const featListFullId = field.split("_");
  const featFieldId = featListFullId[2];

  if (!_creatureFeats) return;

  // update content
  _creatureFeats.Update(parseInt(featFieldId), newValue, oldValue);
}

function UpdateAbilitiesList(field: string, newValue: any, oldValue: any) {
  const abilityListFullId = field.split("_");
  const abilityFieldId = abilityListFullId[2];

  if (!_creatureAbilities) return;

  // update content
  _creatureAbilities.Update(parseInt(abilityFieldId), newValue, oldValue);
}

function UpdateHTMLElementValue(field: string, newValue: string) {
  const element = document.getElementById("res_" + field);

  if (element) {
    // Make sure the event listener doesn't fire when we update the value and create an infinite loop
    element.removeEventListener("change", onEditableFieldChange);

    if (element.tagName.startsWith("VSCODE")) {
      if (element.tagName === "VSCODE-CHECKBOX") {
        (element as HTMLInputElement).checked = parseInt(newValue) > 0;
      } else {
        element.setAttribute("current-value", newValue);
      }
    } else if (element.tagName.startsWith("SP")) {
      element.setAttribute("value", newValue);
    }
    // Handle color pickers
    else if (element.tagName === "INPUT") {
      (element as HTMLInputElement).value = newValue;
    }
    // Handle our custom large drop downs
    else if (element.tagName === "NWN-DROP-DOWN-LARGE") {
      element.setAttribute("value", newValue);
    }

    // Rebind the event listener
    element.addEventListener("change", onEditableFieldChange);
  } else {
    console.log("Element not found: " + field);
  }
}

function getFileData(requestId: number = -1) {
  vscode.postMessage({
    type: "getFileData",
    content: content.data,
    requestId,
  });
}

function BindListeners() {
  const editableFields = content.editableFields;
  for (const field of editableFields) {
    const element = document.getElementById("res_" + field);

    if (!element) {
      console.log("Element not found: " + field);
      return;
    }

    element.addEventListener("change", onEditableFieldChange);
  }

  if (_varTable) {
    _varTable.addEventListener("vartable_change", onEditableFieldChange);
  }

  if (_soundList) {
    _soundList.addEventListener("soundlist_change", onEditableFieldChange);
  }

  if (_plcInventoryList) {
    _plcInventoryList.addEventListener("PLCInventory_change", onEditableFieldChange);
  }

  if (_encounterList) {
    _encounterList.addEventListener("EncounterList_change", onEditableFieldChange);
  }

  if (_restrictionList) {
    _restrictionList.addEventListener("RestrictionList_change", onEditableFieldChange);
  }

  if (_merchantInventory) {
    _merchantInventory.addEventListener("MerchantInventory_change", onEditableFieldChange);
  }

  if (_itemProperties) {
    _itemProperties.addEventListener("ItemProperty_change", onEditableFieldChange);
  }

  if (_creatureInventory) {
    _creatureInventory.addEventListener("CREInventory_change", onEditableFieldChange);
  }

  if (_creatureFeats) {
    _creatureFeats.addEventListener("FeatList_change", onEditableFieldChange);
  }

  if (_creatureAbilities) {
    _creatureAbilities.addEventListener("CreatureAbility_change", onEditableFieldChange);
  }

  initialized = true;
}

function InitHTMLElements() {
  // Set simple fields
  const editableFields = content.editableFields;
  for (const field of editableFields) {
    UpdateHTMLElementValue(field, content.getField(field));
  }

  // Set variable table
  _varTable = <nwnVariables>document.getElementById("VarTable");
  if (_varTable) {
    _varTable.Init(content);
  }

  // Set the sound list
  _soundList = <nwnSoundsList>document.getElementById("SoundList");
  if (_soundList) {
    _soundList.Init(content as Uts);
  }

  // Set the plc inventory list
  _plcInventoryList = <nwnPLCInventory>document.getElementById("PLCInventory");
  if (_plcInventoryList) {
    _plcInventoryList.Init(content as Utp);
  }

  // Set the encounter list
  _encounterList = <nwnEncounterList>document.getElementById("EncounterList");
  if (_encounterList) {
    _encounterList.Init(content as Ute);
  }

  // Set the restriction list
  _restrictionList = <nwnMerchantRestrictions>document.getElementById("RestrictionList");
  if (_restrictionList) {
    _restrictionList.Init(content as Utm);
  }

  // Set the merchant inventory list
  _merchantInventory = <nwnMerchantInventory>document.getElementById("MerchantInventory");
  if (_merchantInventory) {
    _merchantInventory.Init(content as Utm);
  }

  // Set the item appearance fields
  _itemAppearance = <nwnItemAppearance>document.getElementById("ItemAppearance");
  if (_itemAppearance) {
    const baseItemField = document.getElementById("res_BaseItem");
    if (!baseItemField) return;
    _itemAppearance.Init(content as Uti, baseItemField);
  }

  // Set the item property fields
  _itemProperties = <nwnItemProperties>document.getElementById("ItemProperties");
  if (_itemProperties) {
    _itemProperties.Init(content as Uti);
  }

  // Set the creature appearance fields
  _creatureAppearance = <nwnCreatureAppearance>document.getElementById("CreatureAppearanceSection");
  if (_creatureAppearance) {
    const baseApprField = document.getElementById("res_Appearance_Type");
    if (!baseApprField) return;
    _creatureAppearance.Init(content as Utc, baseApprField);
  }

  // Set the creature inventory list
  _creatureInventory = <nwnCreatureInventory>document.getElementById("CREInventory");
  if (_creatureInventory) {
    _creatureInventory.Init(content as Utc);
  }

  // Set the feat list
  _creatureFeats = <nwnCreatureFeats>document.getElementById("FeatsList");
  if (_creatureFeats) {
    _creatureFeats.Init(content as Utc);
  }

  _creatureAbilities = <nwnCreatureAbilities>document.getElementById("SpecialAbilities");
  if (_creatureAbilities) {
    _creatureAbilities.Init(content as Utc);
  }
}
