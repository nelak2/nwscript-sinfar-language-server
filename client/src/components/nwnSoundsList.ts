import { Uts } from "../editorProviders/resData";
import { buildDiv, buildLabel, buildTextField, ButtonType } from "./utils";

export class nwnSoundsList extends HTMLElement {
  _content!: Uts;
  _soundsDiv!: HTMLFieldSetElement;
  constructor() {
    super();

    const soundListRow = this.buildSoundListRow();
    const soundAddRow = this.buildSoundAddRow();

    this.appendChild(soundListRow);
    this.appendChild(soundAddRow);
  }

  public Init(content: Uts) {
    this._content = content;

    this.refreshList();
  }

  public Update(index: number, newValue: any, oldValue: any) {
    // If newValue is undefined then the sound was deleted
    if (newValue === undefined && index >= 0) {
      this._content.SoundList.deleteSound(index);
    }

    // If oldValue is undefined then the sound was added
    if (oldValue === undefined) {
      this._content.SoundList.addSound(newValue);
    }

    // If neither newValue or oldValue are undefined then the sound was updated
    if (newValue !== undefined && oldValue !== undefined) {
      this._content.SoundList.updateSound(index, newValue);
    }

    this.refreshList();
  }

  private refreshList() {
    // Clear the list
    this._soundsDiv.replaceChildren();
    const sounds = this._content.SoundList.getSoundList();

    // Add each sound to the list
    for (let i = 0; i < sounds.length; i++) {
      this.addRow(sounds[i], i);
    }
  }

  // Add HTML elements to the list
  private addRow(sound: string, index: number) {
    const soundListItem = buildTextField({
      id: "snd_item_" + index.toString(),
      value: sound,
      disabled: true,
      style: undefined,
      className: undefined,
      maxLength: 16,
      buttonType: ButtonType.delete,
    });

    const delBtn = soundListItem.querySelector("vscode-button") as HTMLButtonElement;
    if (delBtn) delBtn.addEventListener("click", (e) => this.deleteClickEventHandler(e, index));

    const textField = soundListItem.querySelector("vscode-text-field") as HTMLInputElement;
    if (textField) textField.addEventListener("change", (e) => this.changeEventHandler(e, index));

    this._soundsDiv.appendChild(soundListItem);
  }

  // Add the sound to the list then refresh the list
  private addClickEventHandler(e: Event, newValue: string) {
    const oldValue = this._content.SoundList.addSound(newValue);

    // clear the text field
    const textField = document.getElementById("SoundAdd") as HTMLInputElement;
    if (textField) textField.value = "";

    this.refreshList();

    if (oldValue === newValue) {
      this.dispatchEvent(new CustomEvent("soundlist_change", { detail: { field: this.id, undefined, newValue } }));
    }
  }

  // Delete the sound from the list then refresh the list
  private deleteClickEventHandler(e: Event, index: number) {
    // Don't allow the last sound to be deleted
    if (this._content.SoundList.getSoundList().length === 1) return;

    const oldValue = this._content.SoundList.deleteSound(index);
    this.refreshList();

    // Only fire the event if the value was deleted
    // oldValue will be undefined if the value was not found
    if (oldValue) {
      this.dispatchEvent(
        new CustomEvent("soundlist_change", {
          detail: { field: "SoundList_item_" + index.toString(), oldValue, newValue: undefined },
        }),
      );
    }
  }

  private changeEventHandler(e: Event, index: number) {
    const newValue = (e.target as HTMLInputElement).value;
    const oldValue = this._content.SoundList.updateSound(index, newValue);

    this.dispatchEvent(
      new CustomEvent("soundlist_change", { detail: { field: (e.target as HTMLElement).id, oldValue, newValue } }),
    );
  }

  private buildLabelColumn(text: string, htmlFor: string): HTMLDivElement {
    const label = buildLabel(text, htmlFor);
    const labelDiv = buildDiv("col-label");
    labelDiv.appendChild(label);
    return labelDiv;
  }

  private buildSoundList(): HTMLDivElement {
    const fieldset = document.createElement("fieldset");
    fieldset.id = "SoundList";
    fieldset.style.width = "190px";
    fieldset.style.display = "grid";
    fieldset.style.padding = "5px 5px 5px 5px";
    fieldset.style.borderColor = "var(--input-placeholder-foreground)";
    fieldset.style.borderStyle = "inset";

    const inputCol = buildDiv("col-input");
    inputCol.appendChild(fieldset);

    // Store reference to the fieldset so we can add/remove children
    this._soundsDiv = fieldset;
    return inputCol;
  }

  private buildSoundListRow(): HTMLDivElement {
    const listLabelCol = this.buildLabelColumn("Sounds", "SoundList");
    const listInputCol = this.buildSoundList();

    const listRow = buildDiv("row");
    listRow.appendChild(listLabelCol);
    listRow.appendChild(listInputCol);
    return listRow;
  }

  private buildSoundAddRow(): HTMLDivElement {
    const soundAddLabelCol = this.buildLabelColumn("Add Sound", "SoundAdd_txt");
    const soundAddInputCol = buildTextField({
      id: "SoundAdd",
      value: undefined,
      disabled: false,
      style: undefined,
      className: undefined,
      maxLength: 16,
      buttonType: ButtonType.add,
    });

    // Add event handlers
    const addBtn = soundAddInputCol.querySelector("vscode-button");
    if (addBtn !== null) {
      addBtn.addEventListener("click", (e) => this.addClickEventHandler(e, (soundAddInputCol as HTMLInputElement).value));
    }
    soundAddInputCol.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.addClickEventHandler(e, (soundAddInputCol as HTMLInputElement).value);
      }
    });

    const soundAddRow = buildDiv("row");
    soundAddRow.appendChild(soundAddLabelCol);
    soundAddRow.appendChild(soundAddInputCol);
    return soundAddRow;
  }
}
