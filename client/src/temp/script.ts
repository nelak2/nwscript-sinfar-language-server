import { DropdownListItem, PLCAppearances } from "../components/lists/index";

class DropDown {
  _list: DropdownListItem[] = [];
  _optionBox!: HTMLElement | null;
  _self!: HTMLElement | null;
  _search!: HTMLInputElement | null;
  constructor() {
    this._list = PLCAppearances;
  }

  public load(element: HTMLElement) {
    this._self = element;
    this._optionBox = this._self.querySelector(".option-box");
    this._search = this._self.querySelector(".search-box");

    void this.asyncAddOptions();

    // Setup event listeners
    this._search?.addEventListener("click", this.searchBoxClickHandler);
    // Add event listener to hide the options if we click away
    window.addEventListener("click", this.searchBoxClickOffHandler);
  }

  async asyncAddOptions() {
    if (!this._optionBox) return;

    for (let i = 0; i < this._list.length && i < 100; i++) {
      const option = document.createElement("div");
      option.textContent = this._list[i].label;
      option.setAttribute("data-value", this._list[i].value);

      this._optionBox.appendChild(option);
      this._optionBox.style.maxHeight = "0px";
    }
  }

  searchBoxClickHandler(e: Event) {
    const optionBox = (e.target as HTMLElement).nextElementSibling as HTMLDivElement;

    // Expand it out when you click on it
    optionBox.style.maxHeight = "200px";
    optionBox.style.overflowY = "scroll";
  }

  searchBoxClickOffHandler(e: Event) {
    const select = document.getElementById("res_DropDown") as HTMLDivElement;

    const isClickInside = select.contains(e.target as HTMLElement);

    if (!isClickInside) {
      const optionBox = select.querySelector(".option-box") as HTMLDivElement;
      optionBox.style.maxHeight = "0px";
    }
  }
}

function main() {
  const select = document.getElementById("res_DropDown") as HTMLDivElement;
  const dd = new DropDown();

  dd.load(select);
}

main();
