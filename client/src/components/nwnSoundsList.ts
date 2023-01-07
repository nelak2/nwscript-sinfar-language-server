import { ResData } from "../editorProviders/resData/resdataProvider";
import { buildDiv, buildLabel } from "./utils";

export class nwnSoundsList extends HTMLElement {
  _content!: ResData;
  _soundsDiv!: HTMLFieldSetElement;
  constructor() {
    super();

    const soundListRow = this.buildSoundListRow();
    const soundAddRow = this.buildSoundAddRow();

    this.appendChild(soundListRow);
    this.appendChild(soundAddRow);
  }

  public Init(content: ResData) {
    this._content = content;

    this.refreshList();
  }

  refreshList() {
    // Clear the list
    this._soundsDiv.replaceChildren();
    const sounds = this._content.uts.getSoundList();

    // Add each sound to the list
    for (const sound of sounds) {
      this.addRow(sound);
    }
  }

  // Add HTML elements to the list
  addRow(sound: string) {
    throw new Error("Method not implemented.");
  }

  // Add the sound to the list then refresh the list
  addClickEventHandler(e: Event, newValue: string) {
    const oldValue = this._content.uts.addSound(newValue);

    this.refreshList();

    // Only fire the event if the value changed
    // oldValue will be undefined if the value was added
    // oldValue will be the old value if the value was updated
    // if oldValue === newValue then the value was not changed
    if (oldValue !== newValue) {
      this.dispatchEvent(new CustomEvent("change", { detail: { oldValue, newValue } }));
    }
  }

  // Delete the sound from the list then refresh the list
  deleteClickEventHandler(e: Event, sound: string) {
    const oldValue = this._content.uts.deleteSound(sound);
    this.refreshList();

    // Only fire the event if the value was deleted
    // oldValue will be undefined if the value was not found
    if (oldValue) {
      this.dispatchEvent(new CustomEvent("change", { detail: { oldValue, newValue: undefined } }));
    }
  }

  buildLabelColumn(text: string, htmlFor: string): HTMLDivElement {
    const label = buildLabel(text, htmlFor);
    const labelDiv = buildDiv("col-label");
    labelDiv.appendChild(label);
    return labelDiv;
  }

  buildSoundList(): HTMLDivElement {
    const fieldset = document.createElement("fieldset");
    fieldset.id = "SoundList";
    fieldset.style.width = "275px";
    fieldset.style.margin = "0px";

    const inputCol = buildDiv("col-input");
    inputCol.appendChild(fieldset);

    // Store reference to the fieldset so we can add/remove children
    this._soundsDiv = fieldset;
    return inputCol;
  }

  buildSoundListRow(): HTMLDivElement {
    const listLabelCol = this.buildLabelColumn("Sounds", "SoundList");
    const listInputCol = this.buildSoundList();

    const listRow = buildDiv("row");
    listRow.appendChild(listLabelCol);
    listRow.appendChild(listInputCol);
    return listRow;
  }

  buildSoundAddRow(): HTMLDivElement {
    const soundAddLabelCol = this.buildLabelColumn("Add Sound", "SoundAdd_txt");
    const soundAddInputCol = this.buildSoundAddInput();

    const soundAddRow = buildDiv("row");
    soundAddRow.appendChild(soundAddLabelCol);
    soundAddRow.appendChild(soundAddInputCol);
    return soundAddRow;
  }

  buildSoundAddInput(): HTMLDivElement {
    const textField = document.createElement("vscode-text-field");
    textField.id = "SoundAdd_txt";

    const span = document.createElement("span");
    span.id = "SoundAdd_btn-icon";
    span.className = "codicon codicon-add";

    const button = document.createElement("vscode-button");
    button.id = "SoundAdd_btn";
    button.setAttribute("appearance", "icon");
    button.setAttribute("aria-label", "add");
    button.appendChild(span);

    const inputCol = buildDiv("col-input");
    inputCol.style.display = "flex";
    inputCol.appendChild(textField);
    inputCol.appendChild(button);
    return inputCol;
  }
}

// <nwn-row label="Sounds">
//  <fieldset id="SoundList" style="width: 275px; margin: 0px"></fieldset>
// </nwn-row>
// <div class="row">
//  <div class="col-label">
//   <label class="vscode-input-label" for="SoundAdd_txt">Add Sound:</label>
//  </div>
//  <div class="col-input" style="display: flex">
//   <vscode-text-field id="SoundAdd_txt" label="Add Sound"></vscode-text-field>
//   <vscode-button id="SoundAdd_btn" appearance="icon">
//     <span id="test-icon" class="codicon codicon-add"></span>
//   </vscode-button>
//  </div>
// </div>
