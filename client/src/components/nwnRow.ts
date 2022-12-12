import { buildDiv, buildLabel } from "./utils";

// Handle general row layout
export class nwnRow extends HTMLElement {
  constructor() {
    super();

    const id = this.getAttribute("id") || "";
    const label = this.getAttribute("label");

    if (!label) {
      return;
    }

    const labelElement = buildLabel(label, id);
    labelElement.className = "vscode-input-label";

    const divColLabel = document.createElement("div");
    divColLabel.className = "col-label";
    divColLabel.appendChild(labelElement);

    // Append the children to the input column
    const children: any = this.children;
    const divColInput = buildDiv("col-input");
    if (children.length > 0) {
      for (const child of children) {
        divColInput.appendChild(child);
      }
    }

    // Append the columns to the row
    const divRow = buildDiv("row");
    divRow.appendChild(divColLabel);
    divRow.appendChild(divColInput);

    // Append the row to the element
    this.appendChild(divRow);
  }
}

// <div class="row">
// <div class="col-label">
//   <label class="vscode-input-label" for="res_input_Flags">Flags:</label>
// </div>
// <div class="col-input">
//   <fieldset class="checkbox-set">
//     <vscode-checkbox id="res_input_Flags_SunShadows">Sun Shadows</vscode-checkbox>
//     <vscode-checkbox id="res_input_Flags_MoonShadows">Moon Shadows</vscode-checkbox>
//   </fieldset>
// </div>
// </div>
