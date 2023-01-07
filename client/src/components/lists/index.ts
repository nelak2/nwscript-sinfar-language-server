export type DropdownListItem = {
  value: string;
  label: string;
};

export { SkyBoxes } from "./skyBoxes";
export { LoadScreens } from "./loadScreens";
export { AmbientSounds } from "./ambientSounds";
export { Music } from "./music";
export { EnvironmentalEffects } from "./environmentalEffects";
export { Tilesets } from "./tilesets";
export { TrapTypes } from "./trapTypes";

export const DayNightCycle: DropdownListItem[] = [
  { value: "1", label: "Cycle Day and Night" },
  { value: "2", label: "Always Bright" },
  { value: "3", label: "Always Dark" },
];

export const WindPower: DropdownListItem[] = [
  { value: "0", label: "None" },
  { value: "1", label: "Weak" },
  { value: "2", label: "Strong" },
];

export const PvP: DropdownListItem[] = [
  { value: "0", label: "None" },
  { value: "1", label: "Party" },
  { value: "2", label: "Full" },
  { value: "3", label: "Default" },
];

export const VarType: DropdownListItem[] = [
  { value: "1", label: "Int" },
  { value: "2", label: "Float" },
  { value: "3", label: "String" },
];

export const LinkedToFlags: DropdownListItem[] = [
  { value: "0", label: "None" },
  { value: "1", label: "Door" },
  { value: "2", label: "Waypoint" },
];

export const Cursor: DropdownListItem[] = [
  { value: "0", label: "Default" },
  { value: "1", label: "Transition" },
  { value: "2", label: "Use" },
  { value: "3", label: "Examine" },
  { value: "4", label: "Talk" },
  { value: "5", label: "Walk" },
  { value: "6", label: "XWalk" },
  { value: "7", label: "Attack" },
  { value: "8", label: "Magic" },
  { value: "9", label: "NoUse" },
  { value: "10", label: "Trap" },
];

export const TriggerType: DropdownListItem[] = [
  { value: "0", label: "Generic" },
  { value: "1", label: "AreaTransition" },
  { value: "2", label: "Trap" },
];

export const Faction: DropdownListItem[] = [
  { value: "1", label: "Hostile" },
  { value: "2", label: "Commoner" },
  { value: "3", label: "Merchant" },
  { value: "4", label: "Defender" },
  { value: "5", label: "Selfish" },
  { value: "6", label: "PCKiller" },
  { value: "7", label: "PCAngel" },
];

export const DoorAppearanceType: DropdownListItem[] = [
  { value: "0", label: "doortypes.2da" },
  { value: "1", label: "genericdoors.2da" },
];

export const DoorInitialState: DropdownListItem[] = [
  { value: "0", label: "Closed" },
  { value: "1", label: "Open 1" },
  { value: "2", label: "Open 2" },
];
