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
  PlayTimeType,
  SoundPriority,
  PLCInitialState,
  BodyBag,
  PLCAppearances,
  Difficulty,
  SpawnOption,
  ItemRestrictionType,
  BaseItems,
  MerchantInventoryCategory,
  ipSubType,
  ipType,
  ipValueParamType,
  ipValueType,
  PerceptionRange,
  MovementRate,
  Gender,
  FootstepSound,
  LawChaos,
  GoodEvil,
  Class,
  Race,
  Metamagic,
  CastingClass,
} from "./lists/index";

export class nwnDropDown extends HTMLElement {
  readonly increment = 25;
  list: DropdownListItem[] = [];
  dropDown!: HTMLElement;
  constructor() {
    super();

    const id = this.getAttribute("id");
    // Clear the id so that the div doesn't match the id of the field
    this.setAttribute("id", "");
    const label = this.getAttribute("label");
    const listRef = this.getAttribute("listRef");

    if (!id || !listRef) {
      return;
    }

    switch (listRef) {
      case "DayNightCycle":
        this.list = DayNightCycle;
        break;
      case "WindPower":
        this.list = WindPower;
        break;
      case "SkyBox":
        this.list = SkyBoxes;
        break;
      case "PvP":
        this.list = PvP;
        break;
      case "LoadScreen":
        this.list = LoadScreens;
        break;
      case "AmbientSound":
        this.list = AmbientSounds;
        break;
      case "Music":
        this.list = Music;
        break;
      case "EnvironmentalEffects":
        this.list = EnvironmentalEffects;
        break;
      case "VarType":
        this.list = VarType;
        break;
      case "Faction":
        this.list = Faction;
        break;
      case "TriggerType":
        this.list = TriggerType;
        break;
      case "Cursor":
        this.list = Cursor;
        break;
      case "LinkedToFlags":
        this.list = LinkedToFlags;
        break;
      case "TrapType":
        this.list = TrapTypes;
        break;
      case "DoorAppearanceType":
        this.list = DoorAppearanceType;
        break;
      case "DoorInitialState":
        this.list = DoorInitialState;
        break;
      case "WaypointAppearance":
        this.list = WaypointAppearance;
        break;
      case "PlayTimeType":
        this.list = PlayTimeType;
        break;
      case "SoundPriority":
        this.list = SoundPriority;
        break;
      case "PLCInitialState":
        this.list = PLCInitialState;
        break;
      case "BodyBag":
        this.list = BodyBag;
        break;
      case "PLCAppearances":
        this.list = PLCAppearances;
        break;
      case "Difficulty":
        this.list = Difficulty;
        break;
      case "SpawnOption":
        this.list = SpawnOption;
        break;
      case "ItemRestrictionType":
        this.list = ItemRestrictionType;
        break;
      case "BaseItems":
        this.list = BaseItems;
        break;
      case "MerchantInventoryCategory":
        this.list = MerchantInventoryCategory;
        break;
      case "ipType":
        this.list = ipType;
        break;
      case "ipSubType":
        this.list = ipSubType;
        break;
      case "ipValueType":
        this.list = ipValueType;
        break;
      case "ipValueParamType":
        this.list = ipValueParamType;
        break;
      case "PerceptionRange":
        this.list = PerceptionRange;
        break;
      case "MovementRate":
        this.list = MovementRate;
        break;
      case "Gender":
        this.list = Gender;
        break;
      case "FootstepSound":
        this.list = FootstepSound;
        break;
      case "LawChaos":
        this.list = LawChaos;
        break;
      case "GoodEvil":
        this.list = GoodEvil;
        break;
      case "Class":
        this.list = Class;
        break;
      case "Race":
        this.list = Race;
        break;
      case "Metamagic":
        this.list = Metamagic;
        break;
      case "CastingClass":
        this.list = CastingClass;
        break;
      default:
        this.list = [{ value: "-1", label: "Unknown List" }];
    }

    this.dropDown = document.createElement("vscode-dropdown");
    this.dropDown.id = id;

    void this.addOptionsAsync(this.dropDown, 0, this.list.length - 1);

    const divColInput = buildDiv("col-input");
    divColInput.appendChild(this.dropDown);

    const rowDiv = buildDiv("row");

    if (label) {
      const labelElement = buildLabel(label, id);
      labelElement.className = "vscode-input-label";

      const divColLabel = buildDiv("col-label");
      divColLabel.appendChild(labelElement);

      rowDiv.appendChild(divColLabel);
    }

    rowDiv.appendChild(divColInput);

    this.appendChild(rowDiv);

    const debounce = (fn: Function, ms = 300) => {
      let timeoutId: ReturnType<typeof setTimeout>;
      return function (this: any, ...args: any[]) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), ms);
      };
    };

    this.addEventListener("change", (event) => {
      debounce(() => this.changeEventHandler(event));
    });
  }

  private async addOptionsAsync(dropDown: HTMLElement, start: number, end: number) {
    for (let i = start; i <= end; i++) {
      const option = document.createElement("vscode-option");
      option.setAttribute("value", this.list[i].value);
      option.textContent = this.list[i].label;
      dropDown.appendChild(option);
    }
  }

  changeEventHandler(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = parseInt(target.value);

    let start = value - this.increment;
    let end = value + this.increment;

    if (start < 0) start = 0;
    if (end > this.list.length - 1) end = this.list.length - 1;

    this.dropDown.replaceChildren();

    void this.addOptionsAsync(this.dropDown, start, end);
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
