import "@spectrum-web-components/slider/sp-slider.js";
import "@spectrum-web-components/slider/sync/sp-slider.js";
import "@spectrum-web-components/accordion/sp-accordion.js";
import "@spectrum-web-components/accordion/sp-accordion-item.js";

import { nwnColorPicker } from "./nwnColorPicker";
import { nwnDropDown } from "./nwnDropDown";
import { nwnNumberField } from "./nwnNumberField";
import { nwnTextField } from "./nwnTextField";
import { nwnVolumeSlider } from "./nwnVolumeSlider";
import { nwnRow } from "./nwnRow";
import { nwnVariables } from "./nwnVariables";
import { nwnCreatureAbilities } from "./nwnCreatureAbilities";
import { nwnCreatureFeats } from "./nwnCreatureFeats";
import { nwnCreatureInventory } from "./nwnCreatureInventory";
import { nwnCreatureSpells } from "./nwnCreatureSpells";
import { nwnEncounterList } from "./nwnEncounterList";
import { nwnItemProperties } from "./nwnItemProperties";
import { nwnMerchantInventory } from "./nwnMerchantInventory";
import { nwnMerchantRestrictions } from "./nwnMerchantRestrictions";
import { nwnPLCInventory } from "./nwnPLCInventory";
import { nwnSoundsList } from "./nwnSoundsList";

export { nwnColorPicker } from "./nwnColorPicker";
export { nwnDropDown } from "./nwnDropDown";
export { nwnNumberField } from "./nwnNumberField";
export { nwnTextField } from "./nwnTextField";
export { nwnVolumeSlider } from "./nwnVolumeSlider";
export { nwnRow } from "./nwnRow";
export { nwnCreatureAbilities } from "./nwnCreatureAbilities";
export { nwnCreatureFeats } from "./nwnCreatureFeats";
export { nwnCreatureInventory } from "./nwnCreatureInventory";
export { nwnCreatureSpells } from "./nwnCreatureSpells";
export { nwnEncounterList } from "./nwnEncounterList";
export { nwnItemProperties } from "./nwnItemProperties";
export { nwnMerchantInventory } from "./nwnMerchantInventory";
export { nwnMerchantRestrictions } from "./nwnMerchantRestrictions";
export { nwnPLCInventory } from "./nwnPLCInventory";
export { nwnSoundsList } from "./nwnSoundsList";

export function InitializeNWNControls() {
  customElements.define("nwn-volume-slider", nwnVolumeSlider);
  customElements.define("nwn-text-field", nwnTextField);
  customElements.define("nwn-number-field", nwnNumberField);
  customElements.define("nwn-color-picker", nwnColorPicker);
  customElements.define("nwn-drop-down", nwnDropDown);
  customElements.define("nwn-row", nwnRow);
  customElements.define("nwn-variables", nwnVariables);
  customElements.define("nwn-creature-abilities", nwnCreatureAbilities);
  customElements.define("nwn-creature-feats", nwnCreatureFeats);
  customElements.define("nwn-creature-inventory", nwnCreatureInventory);
  customElements.define("nwn-creature-spells", nwnCreatureSpells);
  customElements.define("nwn-encounter-list", nwnEncounterList);
  customElements.define("nwn-item-properties", nwnItemProperties);
  customElements.define("nwn-merchant-inventory", nwnMerchantInventory);
  customElements.define("nwn-merchant-restrictions", nwnMerchantRestrictions);
  customElements.define("nwn-plc-inventory", nwnPLCInventory);
  customElements.define("nwn-sounds-list", nwnSoundsList);
}
