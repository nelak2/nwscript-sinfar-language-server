import "@spectrum-web-components/slider/sp-slider.js";
import "@spectrum-web-components/slider/sync/sp-slider.js";
import "@spectrum-web-components/accordion/sp-accordion.js";
import "@spectrum-web-components/accordion/sp-accordion-item.js";
// import "@spectrum-web-components/color-area/sp-color-area.js";
// import "@spectrum-web-components/color-slider/sp-color-slider.js";
// import "@spectrum-web-components/popover/sp-popover.js";
// import "@spectrum-web-components/overlay/sync/overlay-trigger.js";
// import "@spectrum-web-components/button/sp-button.js";
// import "@spectrum-web-components/button/sp-clear-button.js";
// import "@spectrum-web-components/button/sp-close-button.js";

import { nwnColorPicker } from "./nwnColorPicker";
import { nwnDropDown } from "./nwnDropDown";
import { nwnNumberField } from "./nwnNumberField";
import { nwnScriptEvents } from "./nwnScriptEvents";
import { nwnTextField } from "./nwnTextField";
import { nwnVolumeSlider } from "./nwnVolumeSlider";
import { nwnRow } from "./nwnRow";

export { nwnColorPicker } from "./nwnColorPicker";
export { nwnDropDown } from "./nwnDropDown";
export { nwnNumberField } from "./nwnNumberField";
export { nwnScriptEvents } from "./nwnScriptEvents";
export { nwnTextField } from "./nwnTextField";
export { nwnVolumeSlider } from "./nwnVolumeSlider";
export { nwnRow } from "./nwnRow";

export function InitializeNWNControls() {
  customElements.define("nwn-script-events", nwnScriptEvents);
  customElements.define("nwn-volume-slider", nwnVolumeSlider);
  customElements.define("nwn-text-field", nwnTextField);
  customElements.define("nwn-number-field", nwnNumberField);
  customElements.define("nwn-color-picker", nwnColorPicker);
  customElements.define("nwn-drop-down", nwnDropDown);
  customElements.define("nwn-row", nwnRow);
}
