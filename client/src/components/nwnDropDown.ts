import { buildLabel, buildDiv } from "./utils";
import { DropdownListItem, DayNightCycle } from "./lists/index";

export class nwnDropDown extends HTMLElement {
  constructor() {
    super();

    const id = this.getAttribute("id");
    const label = this.getAttribute("label");
    const listRef = this.getAttribute("listRef");

    if (!id || !label || !listRef) {
      return;
    }

    let list: DropdownListItem[] = [];
    switch (listRef) {
      case "DayNightCycle":
        list = DayNightCycle;
        break;
      default:
        list = [{ value: "-1", label: "Unknown List" }];
    }

    const labelElement = buildLabel(label, id);
    labelElement.className = "vscode-input-label";

    const divColLabel = buildDiv("col-label");
    divColLabel.appendChild(labelElement);

    const dropDown = document.createElement("vscode-dropdown");
    dropDown.id = id;

    for (const listItem of list) {
      const option = document.createElement("vscode-option");
      option.setAttribute("value", listItem.value);
      option.textContent = listItem.label;
      dropDown.appendChild(option);
    }

    const divColInput = buildDiv("col-input");
    divColInput.appendChild(dropDown);

    const rowDiv = buildDiv("row");
    rowDiv.appendChild(divColLabel);
    rowDiv.appendChild(divColInput);

    this.appendChild(rowDiv);
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
