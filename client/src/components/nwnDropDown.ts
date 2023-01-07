import { buildLabel, buildDiv } from "./utils";
import {
  DropdownListItem,
  DayNightCycle,
  WindPower,
  SkyBoxes,
  PvP,
  LoadScreens,
  AmbientSounds,
  Music,
  EnvironmentalEffects,
  VarType,
  Faction,
  TriggerType,
  Cursor,
  LinkedToFlags,
  TrapTypes,
  DoorAppearanceType,
  DoorInitialState,
  WaypointAppearance,
} from "./lists/index";

export class nwnDropDown extends HTMLElement {
  constructor() {
    super();

    const id = this.getAttribute("id");
    // Clear the id so that the div doesn't match the id of the field
    this.setAttribute("id", "");
    const label = this.getAttribute("label");
    const listRef = this.getAttribute("listRef");

    if (!id || !label || !listRef) {
      return;
    }

    let list: DropdownListItem[] = [];
    switch (listRef) {
      case "DayNightCycle":
        list = DayNightCycle;
        break;
      case "WindPower":
        list = WindPower;
        break;
      case "SkyBox":
        list = SkyBoxes;
        break;
      case "PvP":
        list = PvP;
        break;
      case "LoadScreen":
        list = LoadScreens;
        break;
      case "AmbientSound":
        list = AmbientSounds;
        break;
      case "Music":
        list = Music;
        break;
      case "EnvironmentalEffects":
        list = EnvironmentalEffects;
        break;
      case "VarType":
        list = VarType;
        break;
      case "Faction":
        list = Faction;
        break;
      case "TriggerType":
        list = TriggerType;
        break;
      case "Cursor":
        list = Cursor;
        break;
      case "LinkedToFlags":
        list = LinkedToFlags;
        break;
      case "TrapType":
        list = TrapTypes;
        break;
      case "DoorAppearanceType":
        list = DoorAppearanceType;
        break;
      case "DoorInitialState":
        list = DoorInitialState;
        break;
      case "WaypointAppearance":
        list = WaypointAppearance;
        break;
      default:
        list = [{ value: "-1", label: "Unknown List" }];
    }

    const labelElement = buildLabel(label, id);
    labelElement.className = "vscode-input-label";

    const divColLabel = buildDiv("col-label");
    divColLabel.appendChild(labelElement);

    const dropDown = document.createElement("vscode-dropdown");
    dropDown.id = id;

    for (const listItem of list) {
      const option = document.createElement("vscode-option");
      option.setAttribute("value", listItem.value);
      option.textContent = listItem.label;
      dropDown.appendChild(option);
    }

    const divColInput = buildDiv("col-input");
    divColInput.appendChild(dropDown);

    const rowDiv = buildDiv("row");
    rowDiv.appendChild(divColLabel);
    rowDiv.appendChild(divColInput);

    this.appendChild(rowDiv);
  }
}

// <div class="row">
// <div class="col-label">
//   <label class="vscode-input-label" for="res_input_DayNightCycle">Day/Night Cycle:</label>
// </div>
// <div class="col-input">
//   <vscode-dropdown id="res_input_DayNightCycle">
//     <vscode-option>Cycle Day and Night</vscode-option>
//     <vscode-option>Always Bright</vscode-option>
//     <vscode-option>Always Dark</vscode-option>
//   </vscode-dropdown>
// </div>
// </div>
