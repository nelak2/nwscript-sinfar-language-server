import { buildLabel, buildDiv } from "./utils";

export class nwnDropDown extends HTMLElement {
  constructor() {
    super();

    const id = this.getAttribute("id");
    const label = this.getAttribute("label");
  }
}

// <div class="row">
// <div class="col-label">
//   <label class="vscode-input-label" for="res_input_DayNightCycle">Day/Night Cycle:</label>
// </div>
// <div class="col-input">
//   <vscode-dropdown id="res_input_DayNightCycle">
//     <vscode-option>Cycle Day and Night</vscode-option>
//     <vscode-option>Always Bright</vscode-option>
//     <vscode-option>Always Dark</vscode-option>
//   </vscode-dropdown>
// </div>
// </div>
