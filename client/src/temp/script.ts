import { DropdownListItem, PLCAppearances } from "./components/lists/index";
import * as _ from "lodash";
import { Index } from "flexsearch";
// import Worker from 'flexsearch';

const ITEM_HEIGHT = 22;

class dropDown {
  _list: DropdownListItem[] = [];
  _optionBox: HTMLElement;
  _self: HTMLElement;
  _searchBox: HTMLInputElement;
  _placeholder: HTMLDivElement;

  _start: number = 0;
  _end: number = 0;

  _search: any;
  _filtered: boolean = false;

  constructor() {
    this._list = PLCAppearances;
  }

  public async InitSearch() {
    this._search = new Index("score");

    let i = 0;
    for (const item of PLCAppearances) {
      void this._search.addAsync(i, item.label);
      i++;
    }
  }

  public load(element: HTMLElement) {
    this._self = element;
    this._optionBox = this._self.querySelector(".option-box");
    this._searchBox = this._self.querySelector(".search-box");
    const codicon = this._self.querySelector(".codicon");

    // Initialize search
    void this.InitSearch();

    // Ensure we have a selected item set
    this._self.setAttribute("selecteditem", "0");
    this._searchBox.value = dropdown._list[0].label;

    // Set the height of the placeholder. This ensures our scroll bar is the right size
    this._placeholder = this._optionBox.querySelector(".option-placeholder") as HTMLDivElement;
    this._placeholder.style.height = (this._list.length * ITEM_HEIGHT).toString() + "px";

    void this.LoadOptions(0, 100);

    // Setup event listeners
    this._searchBox.addEventListener("focus", this.searchBoxFocusHandler);
    this._searchBox.addEventListener("blur", this.searchBoxBlurHandler);
    this._searchBox.addEventListener("keydown", this.searchBoxKeyDownHandler);
    this._searchBox.addEventListener("input", this.searchBoxInputHandler);
    codicon.addEventListener("mousedown", this.codiconClickHandler);

    this._optionBox.addEventListener("mousedown", this.optionBoxMouseDownHandler);
    this._optionBox.addEventListener("scroll", _.debounce(this.optionBoxScrollHandler, 200));
  }

  searchBoxInputHandler(e: Event) {
    const options = dropdown._optionBox;
    const filter = dropdown._searchBox.value;

    const results = dropdown._search.search(filter, {
      limit: PLCAppearances.length,
    });

    if (results.length === 0) {
      return;
    }

    dropdown._filtered = true;
    dropdown._list = [];

    // build filtered list
    for (const result of results) {
      const value = PLCAppearances[result].value;
      const label = PLCAppearances[result].label;
      dropdown._list.push({ value, label });
    }

    // load filtered list
    const first = options.firstElementChild;

    let sibling = first.nextElementSibling;
    while (sibling) {
      options.removeChild(sibling);
      sibling = first.nextElementSibling;
    }

    let end: number = 0;
    for (let i = 0; i < dropdown._list.length && i < 100; i++) {
      const index = results[i];
      // console.log({i, index});

      const option = dropdown.buildOption(i);
      // Correcct index being incorrectly set
      option.setAttribute("index", index.toString());
      options.appendChild(option);
      end++;
    }

    dropdown._start = 0;
    dropdown._end = end;

    dropdown._placeholder.style.height = (dropdown._list.length * ITEM_HEIGHT).toString() + "px";
  }

  async searchBoxKeyDownHandler(e: KeyboardEvent) {
    const selectedItem = parseInt(dropdown._self.getAttribute("selecteditem"));
    const searchBox = dropdown._searchBox;

    switch (e.code) {
      case "ArrowUp": {
        if (selectedItem <= 0) return;
        SetSelectedOption(selectedItem - 1);

        break;
      }
      case "ArrowDown": {
        if (selectedItem >= dropdown._list.length - 1) return;
        SetSelectedOption(selectedItem + 1);

        break;
      }
      case "Enter": {
        closeOptionsList();
        break;
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
        for (let i = 0; i < endDiff && prevEnd + i < dropdown._list.length; i++) {
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
    if (end > dropdown._list.length) end = dropdown._list.length;

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

    dropdown._searchBox.select();

    // scroll to selected element
    const selected = GetCurrentOption();

    //console.log("Current selected: " + selected.textContent);

    selected.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "start",
    });
  }

  codiconClickHandler(e: Event) {
    // dropdown._searchBox.focus();

    const optionBox = dropdown._optionBox;

    const maxHeight = optionBox.style.maxHeight;

    if (maxHeight === "200px") {
      closeOptionsList();
    } else {
      optionBox.style.maxHeight = "200px";
      optionBox.style.overflowY = "scroll";

      // scroll to selected element
      const selected = GetCurrentOption();

      //console.log("Current selected: " + selected.textContent);

      selected.scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "start",
      });
    }
  }

  // Search box has lost focus
  searchBoxBlurHandler(e: Event) {
    const searchBox = dropdown._searchBox;

    const index = parseInt(dropdown._self.getAttribute("selecteditem"));

    searchBox.value = PLCAppearances[index].label;

    if (dropdown._filtered) {
      dropdown.resetFilteredList(index);
    }

    closeOptionsList();
  }

  optionBoxMouseDownHandler(e: Event) {
    const clickedElement = e.target as HTMLElement;

    if (clickedElement.className !== "option-item") return;

    const index = parseInt(clickedElement.getAttribute("index"));

    if (dropdown._filtered) {
      dropdown.resetFilteredList(index);
    }

    SetSelectedOption(index);

    closeOptionsList();
  }

  resetFilteredList(index: number) {
    dropdown._list = [];
    dropdown._list = PLCAppearances;
    dropdown._filtered = false;

    dropdown._placeholder.style.height = (dropdown._list.length * ITEM_HEIGHT).toString() + "px";

    dropdown._start = 0;
    dropdown._end = 0;

    dropdown.RecenterOptions(index);
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

function GetCurrentOption(): HTMLElement | null {
  const select = dropdown._self;

  let index = parseInt(select.getAttribute("selecteditem"));

  // If our selected option is outside the list entirely due to filtering
  if (index >= dropdown._list.length) {
    index = 0;
  }

  // If our selected option is outside the range, recenter to it
  if (index <= dropdown._start || index > dropdown._end) {
    dropdown.RecenterOptions(index);
  }

  const selected = dropdown.findElementWithIndex(index);

  return selected;
}

function SetSelectedOption(index: number) {
  const select = dropdown._self;
  const searchBox = dropdown._searchBox;

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
  searchBox.value = dropdown._list[index].label;
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

function Find(input: string) {
  const filter = input.toLowerCase();
  const words = filter.split(" ");

  const results: any[] = [];

  for (const item of PLCAppearances) {
    const label = item.label.toLowerCase();
    let match: number = 0;

    if (label.includes(filter)) {
      // if it matches the full filter
      match = match + 3;
    }
    // check for partial matches
    for (const word of words) {
      if (label.includes(word)) {
        match++;
      }
    }
    if (match > 0) {
      results.push({ match, item });
    }

    if (results.length > 100000) {
      break;
    }
  }
  return results.sort(function (a, b) {
    return b.match - a.match;
  });
}

// function Search(input: string) {
//   const searchResults = dropdown._search.search(input);

//   const results: any[] = [];

//   for (const item of searchResults) {
//     const value = PLCAppearances[item].value;
//     const label = PLCAppearances[item].label;
//     results.push({ value, label });
//   }

//   return results;
// }

main();
