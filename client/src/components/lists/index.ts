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
export { BaseItems } from "./baseItems";
export { ipType } from "./ipType";
export { ipSubType } from "./ipSubType";
export { ipValueType } from "./ipValueType";
export { ipValueParamType } from "./ipValueParamType";
export { Portraits } from "./portraits";
export { SoundSet } from "./soundset";
export { Feats } from "./feats";

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

export const ItemRestrictionType: DropdownListItem[] = [
  { value: "1", label: "Will Not Buy" },
  { value: "2", label: "Will Only Buy" },
];

export const MerchantInventoryCategory: DropdownListItem[] = [
  { value: "0", label: "Armor" },
  { value: "4", label: "Weapon" },
  { value: "3", label: "Jewel" },
  { value: "2", label: "Potions" },
  { value: "1", label: "Miscellaneous" },
];

export const Race: DropdownListItem[] = [
  { value: "0", label: "Dwarf" },
  { value: "1", label: "Elf" },
  { value: "2", label: "Gnome" },
  { value: "3", label: "Halfling" },
  { value: "4", label: "Half-Elf" },
  { value: "5", label: "Half-Orc" },
  { value: "6", label: "Human" },
  { value: "7", label: "Aberration" },
  { value: "8", label: "Animal" },
  { value: "9", label: "Beast" },
  { value: "10", label: "Construct" },
  { value: "11", label: "Dragon" },
  { value: "12", label: "Goblinoid" },
  { value: "13", label: "Monstrous" },
  { value: "14", label: "Orc" },
  { value: "15", label: "Reptilian" },
  { value: "16", label: "Elemental" },
  { value: "17", label: "Fey" },
  { value: "18", label: "Giant" },
  { value: "19", label: "Magical Beast" },
  { value: "20", label: "Outsider" },
  { value: "23", label: "Shapechanger" },
  { value: "24", label: "Undead" },
  { value: "25", label: "Vermin" },
  { value: "29", label: "Ooze" },
];

export const Class: DropdownListItem[] = [
  { value: "0", label: "Barbarian" },
  { value: "1", label: "Bard" },
  { value: "2", label: "Cleric" },
  { value: "3", label: "Druid" },
  { value: "4", label: "Fighter" },
  { value: "5", label: "Monk" },
  { value: "6", label: "Paladin" },
  { value: "7", label: "Ranger" },
  { value: "8", label: "Rogue" },
  { value: "9", label: "Sorcerer" },
  { value: "10", label: "Wizard" },
  { value: "11", label: "Aberration" },
  { value: "12", label: "Animal" },
  { value: "13", label: "Construct" },
  { value: "14", label: "Humanoid" },
  { value: "15", label: "Monstrous" },
  { value: "16", label: "Elemental" },
  { value: "17", label: "Fey" },
  { value: "18", label: "Dragon" },
  { value: "19", label: "Undead" },
  { value: "20", label: "Commoner" },
  { value: "21", label: "Beast" },
  { value: "22", label: "Giant" },
  { value: "23", label: "Magical Beast" },
  { value: "24", label: "Outsider" },
  { value: "25", label: "Shapechanger" },
  { value: "26", label: "Vermin" },
  { value: "27", label: "Shadowdancer" },
  { value: "28", label: "Harper Scout" },
  { value: "29", label: "Arcane Archer" },
  { value: "30", label: "Assassin" },
  { value: "31", label: "Blackguard" },
  { value: "32", label: "Champion of Torm" },
  { value: "33", label: "Weapon Master" },
  { value: "34", label: "Pale Master" },
  { value: "35", label: "Shifter" },
  { value: "36", label: "Dwarven Defender" },
  { value: "37", label: "Red Dragon Disciple" },
  { value: "38", label: "ooze" },
  { value: "41", label: "Purple Dragon Knight" },
];

export const GoodEvil: DropdownListItem[] = [
  { value: "0", label: "Evil" },
  { value: "50", label: "Neutral" },
  { value: "100", label: "Good" },
];

export const LawChaos: DropdownListItem[] = [
  { value: "0", label: "Chaotic" },
  { value: "50", label: "Neutral" },
  { value: "100", label: "Lawful" },
];

export const FootstepSound: DropdownListItem[] = [
  { value: "-1", label: "Default" },
  { value: "0", label: "normal" },
  { value: "1", label: "large" },
  { value: "2", label: "dragon" },
  { value: "3", label: "soft" },
  { value: "4", label: "hoof" },
  { value: "5", label: "hoof_large" },
  { value: "6", label: "beetle" },
  { value: "7", label: "spider" },
  { value: "8", label: "skeleton" },
  { value: "9", label: "leather_wing" },
  { value: "10", label: "feather_wing" },
  { value: "11", label: "lizard" },
  { value: "12", label: "none" },
  { value: "13", label: "seagull" },
  { value: "14", label: "shark" },
  { value: "15", label: "water_normal" },
  { value: "16", label: "water_large" },
  { value: "17", label: "horse" },
  { value: "29", label: "bio_reserved" },
  { value: "30", label: "slime" },
  { value: "31", label: "treant" },
  { value: "32", label: "Wasp" },
  { value: "33", label: "CODI_Monodrone" },
  { value: "34", label: "CODI_Marut" },
  { value: "61", label: "dragonc" },
  { value: "49", label: "cep_reserved" },
  { value: "59", label: "USER" },
  { value: "60", label: "Kuotoa" },
  { value: "62", label: "re_zombi" },
  { value: "63", label: "re_hunter" },
  { value: "64", label: "re_cerberus" },
];

export const Gender: DropdownListItem[] = [
  { value: "0", label: "Male" },
  { value: "1", label: "Female" },
  { value: "2", label: "Both" },
  { value: "3", label: "Other" },
  { value: "4", label: "None" },
];

export const MovementRate: DropdownListItem[] = [
  { value: "1", label: "Immobile" },
  { value: "2", label: "Very Slow" },
  { value: "3", label: "Slow" },
  { value: "4", label: "Normal" },
  { value: "5", label: "Fast" },
  { value: "6", label: "Very Fast" },
  { value: "7", label: "Default" },
  { value: "8", label: "DM Fast" },
];

export const PerceptionRange: DropdownListItem[] = [
  { value: "8", label: "Short (10m sight/10m listen)" },
  { value: "9", label: "Medium (20m sight/20m listen)" },
  { value: "10", label: "Long (35m sight/20m listen)" },
  { value: "11", label: "Default" },
];
