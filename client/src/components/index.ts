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

export { nwnColorPicker } from "./nwnColorPicker";
export { nwnDropDown } from "./nwnDropDown";
export { nwnNumberField } from "./nwnNumberField";
export { nwnTextField } from "./nwnTextField";
export { nwnVolumeSlider } from "./nwnVolumeSlider";
export { nwnRow } from "./nwnRow";

export function InitializeNWNControls() {
  customElements.define("nwn-volume-slider", nwnVolumeSlider);
  customElements.define("nwn-text-field", nwnTextField);
  customElements.define("nwn-number-field", nwnNumberField);
  customElements.define("nwn-color-picker", nwnColorPicker);
  customElements.define("nwn-drop-down", nwnDropDown);
  customElements.define("nwn-row", nwnRow);
  customElements.define("nwn-variables", nwnVariables);
}
