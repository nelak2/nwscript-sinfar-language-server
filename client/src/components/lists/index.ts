export type DropdownListItem = {
  value: string;
  label: string;
};

export { SkyBoxes } from "./skyBoxes";
export { LoadScreens } from "./loadScreens";
export { AmbientSounds } from "./ambientSounds";
export { Music } from "./music";
export { EnvironmentalEffects } from "./environmentalEffects";

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
  { value: "2", label: "Default" },
];

export const VarType: DropdownListItem[] = [
  { value: "1", label: "Int" },
  { value: "2", label: "Float" },
  { value: "3", label: "String" },
];
