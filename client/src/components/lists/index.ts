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
export { PLCAppearances } from "./plcAppearances";
export { CreatureAppearances } from "./creatureAppearances";

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

export const WaypointAppearance: DropdownListItem[] = [
  { value: "1", label: "Blue" },
  { value: "2", label: "Red" },
  { value: "3", label: "Green" },
  { value: "4", label: "Yellow" },
];

export const PlayTimeType: DropdownListItem[] = [
  { value: "0", label: "Specific Hours" },
  { value: "1", label: "Day" },
  { value: "2", label: "Night" },
  { value: "3", label: "Always" },
];

export const SoundPriority: DropdownListItem[] = [
  { value: "0", label: "0 (Unmaskable_Sound)" },
  { value: "1", label: "1 (Music_Stingers)" },
  { value: "2", label: "2 (Looping_AreaWide_Ambients)" },
  { value: "3", label: "3 (Looping_Positional_Ambients)" },
  { value: "4", label: "4 (Looping_Player)" },
  { value: "5", label: "5 (Looping_NonPlayer)" },
  { value: "6", label: "7 (Player_Chat)" },
  { value: "7", label: "7 (Non_Player_Chat)" },
  { value: "8", label: "8 (Scripted_PlaySound)" },
  { value: "9", label: "9 (GUI)" },
  { value: "10", label: "10 (Area_Spell_Effects)" },
  { value: "11", label: "11 (Normal_Spell_Effects)" },
  { value: "12", label: "12 (Projectile)" },
  { value: "13", label: "13 (Combat)" },
  { value: "14", label: "14 (Large_Creature_Vocalizations)" },
  { value: "15", label: "15 (Medium_and_Small_Creature_Voclizations)" },
  { value: "16", label: "16 (Large_Creature_Footsteps)" },
  { value: "17", label: "17 (Player_Footsteps)" },
  { value: "18", label: "18 (Medium_and_Small_Creature_Footsteps)" },
  { value: "19", label: "19 (Single_Shot_Global)" },
  { value: "20", label: "20 (Single_Shot_Positional)" },
  { value: "21", label: "255 (Default)" },
];

export const PLCInitialState: DropdownListItem[] = [
  { value: "0", label: "Default" },
  { value: "1", label: "Open" },
  { value: "2", label: "Closed" },
  { value: "3", label: "Destroyed" },
];

export const BodyBag: DropdownListItem[] = [
  { value: "0", label: "Default" },
  { value: "1", label: "Potion" },
  { value: "2", label: "Scroll" },
  { value: "3", label: "Treasure" },
  { value: "4", label: "Body" },
  { value: "5", label: "Bones" },
  { value: "6", label: "Pouch" },
];

export const Difficulty: DropdownListItem[] = [
  { value: "0", label: "Very Easy" },
  { value: "1", label: "Easy" },
  { value: "2", label: "Normal" },
  { value: "3", label: "Hard" },
  { value: "4", label: "Impossible" },
];

export const SpawnOption: DropdownListItem[] = [
  { value: "0", label: "Continuous" },
  { value: "1", label: "Single Shot" },
];
