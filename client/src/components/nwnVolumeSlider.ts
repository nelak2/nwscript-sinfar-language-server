import { buildLabel, buildDiv } from "./utils";

export class nwnVolumeSlider extends HTMLElement {
  constructor() {
    super();

    const id = this.getAttribute("id");
    // Clear the id so that the div doesn't match the id of the slider
    this.setAttribute("id", "");
    const label = this.getAttribute("label");

    if (!id || !label) {
      return;
    }

    const labelElement = buildLabel(label, id);
    labelElement.className = "vscode-input-label";

    const divColLabel = buildDiv("col-label");
    divColLabel.appendChild(labelElement);

    const slider = document.createElement("sp-slider");
    slider.id = id;
    slider.min = 0;
    slider.max = 127;
    slider.value = 64;
    slider.step = 1;
    slider.editable = true;
    slider.variant = "ramp";

    const div = buildDiv("");
    div.style.width = "300px";
    div.appendChild(slider);

    const divColInput = buildDiv("col-input");
    divColInput.appendChild(div);

    const rowDiv = buildDiv("row");
    rowDiv.appendChild(divColLabel);
    rowDiv.appendChild(divColInput);

    this.appendChild(rowDiv);
  }
}

// <div class="row">
// <div class="col-label">
//   <label class="vscode-input-label" for="res_input_AmbientSndDayVol">Day - Ambient Volume:</label>
// </div>
// <div class="col-input">
//   <div style="width: 300px">
//     <sp-slider editable="" max="127" min="0" value="64" step="1" variant="ramp"> </sp-slider>
//   </div>
//   <number-field-defined id="res_input_AmbientSndDayVol"></number-field-defined>
// </div>
// </div>
