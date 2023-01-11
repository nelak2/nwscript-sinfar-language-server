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
    this._optionBox.addEventListener("scroll", this.optionBoxScrollHandler);
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

  // TODO: Add a scroll handler to load more options when we get to the bottom
  // TODO: We can set the height of the option box to the height it would be if we had loaded all the elements
  // this way our scroll bar will be correct and we can load more options as the user scrolls
  optionBoxScrollHandler(e: Event) {
    let target = e.target as HTMLDivElement;
    console.log(target.scrollHeight);
    console.log(target.scroll);
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
