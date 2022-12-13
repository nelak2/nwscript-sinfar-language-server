import { buildDiv, buildLabel } from "./utils";
import { NumberField } from "@spectrum-web-components/number-field";

export class nwnNumberField extends HTMLElement {
  constructor() {
    super();

    const id = this.getAttribute("id");
    // Clear the id so that the div doesn't match the id of the field
    this.setAttribute("id", "");
    const label = this.getAttribute("label");
    const unit = this.getAttribute("unit");

    if (!id || !label || !unit) {
      return;
    }

    const labelElement = buildLabel(label, id);
    labelElement.className = "vscode-input-label";

    const divColLabel = buildDiv("col-label");
    divColLabel.appendChild(labelElement);

    const numberField = new NumberField();
    numberField.id = id;

    switch (unit) {
      case "miliseconds":
        numberField.setAttribute("min", "0");
        numberField.style.width = "100px";
        numberField.value = 0;
        numberField.formatOptions = { style: "unit", unit: "ms" };
        break;
      case "percent":
        numberField.setAttribute("min", "0");
        numberField.setAttribute("max", "100");
        numberField.style.width = "100px";
        numberField.value = 0;
        numberField.formatOptions = { style: "percent" };
        break;
      case "fog":
        numberField.setAttribute("min", "0");
        numberField.setAttribute("max", "200");
        numberField.style.width = "100px";
        numberField.value = 0;
        break;
      case "distance":
        numberField.setAttribute("min", "0");
        numberField.setAttribute("max", "1000");
        numberField.style.width = "100px";
        numberField.value = 0;
        numberField.formatOptions = { style: "unit", unit: "m" };
        break;
      case "skill":
        numberField.setAttribute("min", "0");
        numberField.setAttribute("max", "127");
        numberField.style.width = "100px";
        numberField.value = 0;
        break;
    }

    const divColInput = buildDiv("col-input");
    divColInput.appendChild(numberField);

    const divRow = buildDiv("row");
    divRow.appendChild(divColLabel);
    divRow.appendChild(divColInput);

    this.appendChild(divRow);
  }
}

// <div class="row">
// <div class="col-label">
//   <label class="vscode-input-label" for="res_input_MusicDelay">Music Playing Delay:</label>
// </div>
// <div class="col-input">
//   <sp-number-field
//     id="res_input_MusicDelay"
//     style="width: 100px"
//     value="0"
//     format-options='{
//                   "style": "percent"
//                   }'
//   ></sp-number-field>
// </div>
// </div>
