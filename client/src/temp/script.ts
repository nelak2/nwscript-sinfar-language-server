import { DropdownListItem, PLCAppearances } from "./components/lists/index";
import * as fs from "node:fs";
import * as _ from "lodash";

const ITEM_HEIGHT = 22;

class dropDown {
  _list: DropdownListItem[] = [];
  _optionBox: HTMLElement;
  _self: HTMLElement;
  _search: HTMLInputElement;

  _start: number = 0;
  _end: number = 0;

  constructor() {
    this._list = PLCAppearances;
  }

  public load(element: HTMLElement) {
    this._self = element;
    this._optionBox = this._self.querySelector(".option-box");
    this._search = this._self.querySelector(".search-box");

    // Ensure we have a selected item set
    this._self.setAttribute("selecteditem", "0");
    this._search.value = PLCAppearances[0].label;

    // Set the height of the placeholder. This ensures our scroll bar is the right size
    const placeholder = this._optionBox.querySelector(".option-placeholder") as HTMLDivElement;
    placeholder.style.height = (this._list.length * ITEM_HEIGHT).toString() + "px";

    void this.LoadOptions(0, 100);

    // Setup event listeners
    this._search.addEventListener("focus", this.searchBoxFocusHandler);
    this._search.addEventListener("blur", this.searchBoxBlurHandler);
    this._search.addEventListener("keydown", this.searchBoxKeyDownHandler);

    this._optionBox.addEventListener("mousedown", this.optionBoxMouseDownHandler);
    this._optionBox.addEventListener("scroll", _.debounce(this.optionBoxScrollHandler, 200));
  }

  searchBoxKeyDownHandler(e: KeyboardEvent) {
    const selectedItem = parseInt(dropdown._self.getAttribute("selecteditem"));

    switch (e.code) {
      case "ArrowUp": {
        if (selectedItem <= 0) return;
        SetSelectedOption(selectedItem - 1);

        break;
      }
      case "ArrowDown": {
        if (selectedItem >= PLCAppearances.length - 1) return;
        SetSelectedOption(selectedItem + 1);

        break;
      }
      case "Enter": {
        closeOptionsList();
      }
    }
  }

  buildOption(index: number): HTMLElement {
    const option = document.createElement("div") as HTMLDivElement;
    option.className = "option-item";
    option.textContent = this._list[index].label;
    option.setAttribute("data-value", this._list[index].value);
    option.setAttribute("index", index.toString());

    // option.style.position = 'absolute';
    option.style.top = (index * ITEM_HEIGHT).toString() + "px";

    return option;
  }

  LoadOptions(start: number, end: number) {
    const prevStart = dropdown._start;
    const prevEnd = dropdown._end;

    const options = dropdown._optionBox;

    // Calculate overlap
    const overlap = Math.max(0, Math.min(end, prevEnd) - Math.max(start, prevStart));

    let endDiff = end - prevEnd;
    let startDiff = start - prevStart;

    if (overlap) {
      if (endDiff > 0) {
        for (let i = 0; i < endDiff && prevEnd + i < PLCAppearances.length; i++) {
          const added = options.appendChild(this.buildOption(prevEnd + i));
        }
      } else if (endDiff < 0) {
        endDiff = Math.abs(endDiff);
        let i = 0;
        while (i < endDiff) {
          const removed = options.removeChild(options.lastElementChild);
          i++;
        }
      }

      if (startDiff < 0) {
        let previousChild = options.firstElementChild;
        for (let i = start; i < prevStart; i++) {
          previousChild = previousChild.insertAdjacentElement("afterend", this.buildOption(i));
        }
      } else if (startDiff > 0) {
        startDiff = Math.abs(startDiff);

        const removeArray: Node[] = [];

        // Skip 1 element since it is the placeholder
        for (let i = 1; i < startDiff + 1; i++) {
          removeArray.push(options.children[i]);
        }

        for (const node of removeArray) {
          options.removeChild(node);
        }
      }
    } else {
      let nodes: (string | Node)[] = [];
      // add the placeholder child

      const first = options.firstElementChild;

      let sibling = first.nextElementSibling;
      while (sibling) {
        options.removeChild(sibling);
        sibling = first.nextElementSibling;
      }

      for (let i = start; i < end; i++) {
        options.appendChild(dropdown.buildOption(i));
      }
    }

    dropdown._start = start;
    dropdown._end = end;
  }

  RecenterOptions(center: number) {
    let start = center - 100;
    if (start < 100) start = 0;

    let end = center + 100;
    if (end > PLCAppearances.length) end = PLCAppearances.length;

    dropdown.LoadOptions(parseInt(start.toFixed(0)), parseInt(end.toFixed(0)));
  }

  optionBoxScrollHandler(e: Event) {
    let target = e.target as HTMLDivElement;

    const currentIndex = target.scrollTop / ITEM_HEIGHT;

    dropdown.RecenterOptions(currentIndex);
  }

  // Searchbox has received focus
  searchBoxFocusHandler(e: Event) {
    const optionBox = dropdown._optionBox;

    // Expand it out when you click on it
    optionBox.style.maxHeight = "200px";
    optionBox.style.overflowY = "scroll";

    // scroll to selected element
    const selected = GetCurrentOption();
    selected.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "start",
    });
  }

  // Search box has lost focus
  searchBoxBlurHandler(e: Event) {
    const start = dropdown._start;
    const end = dropdown._end;

    closeOptionsList();
  }

  optionBoxMouseDownHandler(e: Event) {
    const clickedElement = e.target as HTMLElement;

    if (clickedElement.className !== "option-item") return;

    SetSelectedOption(parseInt(clickedElement.getAttribute("index")));

    closeOptionsList();
  }

  findElementWithIndex(index: number): HTMLDivElement | null {
    const optionBox = dropdown._optionBox;

    for (const child of optionBox.children) {
      const childIndex = parseInt(child.getAttribute("index"));
      if (childIndex === index) {
        return child as HTMLDivElement;
      }
    }
    return null;
  }
}

let dropdown: dropDown;

function closeOptionsList() {
  const optionBox = dropdown._optionBox;

  optionBox.style.maxHeight = "0px";
}

function GetCurrentOption(): HTMLElement {
  const select = dropdown._self;

  const index = parseInt(select.getAttribute("selecteditem"));
  const selected = dropdown.findElementWithIndex(index);

  return selected;
}

function SetSelectedOption(index: number) {
  const select = dropdown._self;
  const searchBox = dropdown._search;

  dropdown.RecenterOptions(index);

  const previousIndex = parseInt(select.getAttribute("selecteditem"));
  const previousSelect = dropdown.findElementWithIndex(previousIndex);
  if (previousSelect) previousSelect.classList.toggle("option-hover", false);

  const selectedOption = dropdown.findElementWithIndex(index);
  selectedOption.classList.toggle("option-hover", true);
  selectedOption.scrollIntoView({
    behavior: "auto",
    block: "nearest",
    inline: "start",
  });

  select.setAttribute("selecteditem", index.toString());
  searchBox.value = PLCAppearances[index].label;
}

async function main() {
  const select = document.getElementById("res_DropDown") as HTMLDivElement;
  dropdown = new dropDown();

  dropdown.load(select);
}

function VerifyList() {
  const start = dropdown._start;
  const end = dropdown._end;

  for (let i = start; i < end; i++) {
    const option = dropdown.findElementWithIndex(i);

    if (option === null) {
      console.log("Missing option: " + i);
    }

    const label = option.textContent;

    if (PLCAppearances[i].label !== label) {
      console.log("Incorrect label at (" + i + ")" + " " + label);
    }

    const value = option.getAttribute("data-value");

    if (PLCAppearances[i].value !== value) {
      console.log("Incorrect value at (" + i + ")" + " " + value);
    }
  }

  console.log("Verified");
}

main();
