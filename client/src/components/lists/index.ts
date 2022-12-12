export type DropdownListItem = {
  value: string;
  label: string;
};

export const DayNightCycle: DropdownListItem[] = [
  { value: "1", label: "Cycle Day and Night" },
  { value: "2", label: "Always Bright" },
  { value: "3", label: "Always Dark" },
];
