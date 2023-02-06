import * as _ from "lodash";
import { DropdownListItem, PLCAppearances, CreatureAppearances, Portraits, SoundSet, Feats, Abilities } from "./lists";
import { Index } from "flexsearch";

export class nwnDropDownLarge extends HTMLElement {
  static get observedAttributes() {
    return ["value"];
  }

  private readonly ITEM_HEIGHT = 22;

  private _originalList: DropdownListItem[] = [];

  private _list: DropdownListItem[] = [];
  private _optionBox!: HTMLDivElement;
  private _searchBox!: HTMLInputElement;
  private _placeholder!: HTMLDivElement;
  private _codicon!: HTMLElement;
  private readonly _shadow!: ShadowRoot;

  private _start: number = 0;
  private _end: number = 0;

  private _search: any;
  private _filtered: boolean = false;

  constructor() {
    super();

    this._shadow = this.attachShadow({ mode: "open" });
    // create style content and load it into the shadow dom
    const style = document.createElement("style");
    style.textContent = this._style;

    // set the html content and load it into the shadow dom
    this._shadow.innerHTML = this._html;

    // append the style to the shadow dom
    this._shadow.appendChild(style);
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "value") {
      this.value = newValue;
    }
  }

  public get value(): string {
    const attributeValue = this.getAttribute("selecteditem");
    if (!attributeValue) return "0";
    const selectedItem = parseInt(attributeValue);
    return this._list[selectedItem].value;
  }

  public set value(value: string) {
    const currentValue = this.value;
    if (currentValue === value) return;

    const index = this._originalList.findIndex((item) => item.value === value);
    if (index === -1) return;

    this.ResetFilteredList(index);
    this.SetSelectedOption(index);
  }

  connectedCallback() {
    const list = this.getAttribute("listref");

    switch (list) {
      case "PLCAppearances": {
        this._originalList = PLCAppearances;
        break;
      }
      case "CreatureAppearances": {
        this._originalList = CreatureAppearances;
        break;
      }
      case "Portraits": {
        this._originalList = Portraits;
        break;
      }
      case "SoundSet": {
        this._originalList = SoundSet;
        break;
      }
      case "Feats": {
        this._originalList = Feats;
        break;
      }
      case "Abilities": {
        this._originalList = Abilities;
        break;
      }
      default: {
        this._originalList = [{ value: "0", label: "Invalid List" }];
      }
    }
    this._list = this._originalList;

    this._optionBox = this._shadow.querySelector(".option-box") as HTMLDivElement;
    this._searchBox = this._shadow.querySelector(".search-box") as HTMLInputElement;
    this._placeholder = this._shadow.querySelector(".option-placeholder") as HTMLDivElement;
    this._codicon = this._shadow.querySelector(".codicon") as HTMLElement;

    this.className = "parent";
    this.setAttribute("selecteditem", "0");
    this._searchBox.value = this._list[0].label;
    this._placeholder.style.height = (this._list.length * this.ITEM_HEIGHT).toString() + "px";

    void this.InitSearch();
    void this.LoadOptions(0, 100);

    // Setup event listeners
    this._searchBox.addEventListener("focus", (e) => {
      this.SearchBoxFocusHandler(e);
    });
    this._searchBox.addEventListener("blur", (e) => {
      this.SearchBoxBlurHandler(e);
    });
    this._searchBox.addEventListener("keydown", (e) => {
      void this.SearchBoxKeyDownHandler(e);
    });
    this._searchBox.addEventListener("input", (e) => {
      this.SearchBoxInputHandler(e);
    });
    this._codicon.addEventListener("mousedown", (e) => {
      this.CodiconClickHandler(e);
    });

    this._optionBox.addEventListener("mousedown", (e) => {
      this.OptionBoxMouseDownHandler(e);
    });
    this._optionBox.addEventListener(
      "scroll",
      _.debounce((e) => {
        this.OptionBoxScrollHandler(this, e);
      }, 200),
    );
  }

  public async InitSearch() {
    // This is correct. Just an issue with the type definition
    // @ts-expect-error
    this._search = new Index("score");

    let i = 0;
    for (const item of this._originalList) {
      void this._search.addAsync(i, item.label);
      i++;
    }
  }

  private SearchBoxInputHandler(e: Event) {
    const options = this._optionBox;
    const filter = this._searchBox.value;

    const results = this._search.search(filter, {
      limit: this._originalList.length,
    });

    if (results.length === 0) {
      return;
    }

    this._filtered = true;
    this._list = [];

    // build filtered list
    for (const result of results) {
      const value = this._originalList[result].value;
      const label = this._originalList[result].label;
      this._list.push({ value, label });
    }

    // load filtered list
    const first = options.firstElementChild;

    if (first) {
      let sibling = first.nextElementSibling;
      while (sibling) {
        options.removeChild(sibling);
        sibling = first.nextElementSibling;
      }
    }

    let end: number = 0;
    for (let i = 0; i < this._list.length && i < 100; i++) {
      const index = results[i];
      // console.log({i, index});

      const option = this.BuildOption(i);
      // Correct index being incorrectly set
      option.setAttribute("index", index.toString());
      options.appendChild(option);
      end++;
    }

    this._start = 0;
    this._end = end;

    this._placeholder.style.height = (this._list.length * this.ITEM_HEIGHT).toString() + "px";
  }

  private async SearchBoxKeyDownHandler(e: KeyboardEvent) {
    const attributeValue = this.getAttribute("selecteditem");
    if (!attributeValue) return;
    const selectedItem = parseInt(attributeValue);

    switch (e.code) {
      case "ArrowUp": {
        if (selectedItem <= 0) return;
        this.SetSelectedOption(selectedItem - 1);

        break;
      }
      case "ArrowDown": {
        if (selectedItem >= this._list.length - 1) return;
        this.SetSelectedOption(selectedItem + 1);

        break;
      }
      case "Enter": {
        this.CloseOptionsList();
        break;
      }
    }
  }

  private BuildOption(index: number): HTMLElement {
    const option = document.createElement("div");
    option.className = "option-item";
    option.textContent = this._list[index].label;
    option.setAttribute("index", index.toString());

    // option.style.position = 'absolute';
    option.style.top = (index * this.ITEM_HEIGHT).toString() + "px";

    return option;
  }

  private LoadOptions(start: number, end: number) {
    const prevStart = this._start;
    const prevEnd = this._end;

    const options = this._optionBox;

    // Calculate overlap
    const overlap = Math.max(0, Math.min(end, prevEnd) - Math.max(start, prevStart));

    let endDiff = end - prevEnd;
    let startDiff = start - prevStart;

    if (overlap) {
      if (endDiff > 0) {
        for (let i = 0; i < endDiff && prevEnd + i < this._list.length; i++) {
          options.appendChild(this.BuildOption(prevEnd + i));
        }
      } else if (endDiff < 0) {
        endDiff = Math.abs(endDiff);
        let i = 0;
        while (i < endDiff) {
          const lastChild = options.lastElementChild;
          if (!lastChild) break; // no more children
          options.removeChild(options.lastElementChild);
          i++;
        }
      }

      if (startDiff < 0) {
        let previousChild = options.firstElementChild;
        for (let i = start; i < prevStart; i++) {
          if (!previousChild) return; // no children (shouldn't happen)
          previousChild = previousChild.insertAdjacentElement("afterend", this.BuildOption(i));
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
      if (!first) return; // no children (shouldn't happen)

      let sibling = first.nextElementSibling;
      while (sibling) {
        options.removeChild(sibling);
        sibling = first.nextElementSibling;
      }

      for (let i = start; i < end; i++) {
        options.appendChild(this.BuildOption(i));
      }
    }

    this._start = start;
    this._end = end;
  }

  private RecenterOptions(center: number) {
    let start = center - 100;
    if (start < 100) start = 0;

    let end = center + 100;
    if (end > this._list.length) end = this._list.length;

    this.LoadOptions(parseInt(start.toFixed(0)), parseInt(end.toFixed(0)));
  }

  private OptionBoxScrollHandler(self: nwnDropDownLarge, e: Event) {
    // can't use e.target because it is null for some reason
    const target = (e as any).path[0] as HTMLDivElement;
    const currentIndex = target.scrollTop / self.ITEM_HEIGHT;

    self.RecenterOptions(currentIndex);
  }

  // Searchbox has received focus
  private SearchBoxFocusHandler(e: Event) {
    const optionBox = this._optionBox;

    // Expand it out when you click on it
    optionBox.style.maxHeight = "200px";
    optionBox.style.overflowY = "scroll";

    this._searchBox.select();

    // scroll to selected element
    const selected = this.GetCurrentOption();

    // console.log("Current selected: " + selected.textContent);

    selected.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "start",
    });
  }

  private CodiconClickHandler(e: Event) {
    // dropdown._searchBox.focus();

    const optionBox = this._optionBox;

    const maxHeight = optionBox.style.maxHeight;

    if (maxHeight === "200px") {
      this.CloseOptionsList();
    } else {
      optionBox.style.maxHeight = "200px";
      optionBox.style.overflowY = "scroll";

      // scroll to selected element
      const selected = this.GetCurrentOption();

      // console.log("Current selected: " + selected.textContent);

      selected.scrollIntoView({
        behavior: "auto",
        block: "nearest",
        inline: "start",
      });
    }
  }

  // Search box has lost focus
  private SearchBoxBlurHandler(e: Event) {
    const searchBox = this._searchBox;

    const selecteditem = this.getAttribute("selecteditem");
    if (!selecteditem) return;
    const index = parseInt(selecteditem);

    searchBox.value = this._originalList[index].label;

    if (this._filtered) {
      this.ResetFilteredList(index);
    }

    this.CloseOptionsList();
  }

  private OptionBoxMouseDownHandler(e: Event) {
    const clickedElement = e.target as HTMLElement;

    if (clickedElement.className !== "option-item") return;

    const indexattr = clickedElement.getAttribute("index");
    if (!indexattr) return;
    const index = parseInt(indexattr);

    if (this._filtered) {
      this.ResetFilteredList(index);
    }

    this.SetSelectedOption(index);

    this.CloseOptionsList();
  }

  private ResetFilteredList(index: number) {
    this._list = [];
    this._list = this._originalList;
    this._filtered = false;

    this._placeholder.style.height = (this._list.length * this.ITEM_HEIGHT).toString() + "px";

    this._start = 0;
    this._end = 0;

    this.RecenterOptions(index);
  }

  private FindElementWithIndex(index: number): HTMLDivElement | null {
    const optionBox = this._optionBox.children as any;

    for (const child of optionBox) {
      const childIndex = parseInt(child.getAttribute("index"));
      if (childIndex === index) {
        return child as HTMLDivElement;
      }
    }
    return null;
  }

  private CloseOptionsList() {
    this._optionBox.style.maxHeight = "0px";
  }

  private GetCurrentOption(): HTMLDivElement {
    const select = this.getAttribute("selecteditem");
    if (!select) throw new Error("No selected item");
    let index = parseInt(select);

    // If our selected option is outside the list entirely due to filtering
    if (index >= this._list.length) {
      index = 0;
    }

    // If our selected option is outside the range, recenter to it
    if (index <= this._start || index > this._end) {
      this.RecenterOptions(index);
    }

    const selected = this.FindElementWithIndex(index);
    if (!selected) throw new Error("No selected item");

    return selected;
  }

  private SetSelectedOption(index: number) {
    this.RecenterOptions(index);

    const selecteditem = this.getAttribute("selecteditem");
    if (!selecteditem) return;
    const previousIndex = parseInt(selecteditem);
    const previousSelect = this.FindElementWithIndex(previousIndex);
    if (previousSelect) previousSelect.classList.toggle("option-hover", false);

    const selectedOption = this.FindElementWithIndex(index);
    if (!selectedOption) return;

    selectedOption.classList.toggle("option-hover", true);
    selectedOption.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "start",
    });

    this.setAttribute("selecteditem", index.toString());
    this._searchBox.value = this._list[index].label;

    this.dispatchEvent(new Event("change"));
  }

  private readonly _html: string = `
    <div class="parent">
        <input class="search-box" />
        <div class="option-box">
            <div class="option-placeholder"></div>
        </div>
        <svg class="codicon select-indicator" part="select-indicator" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
			<path fill-rule="evenodd" clip-rule="evenodd" d="M7.976 10.072l4.357-4.357.62.618L8.284 11h-.618L3 6.333l.619-.618 4.357 4.357z"></path>
		</svg>
    </div>
  `;

  private readonly _style: string = `
    :host,
    :root {
    --search-box-width: 286px;
    --search-box-height: 200px;
    }

    * {
    font-family: var(--vscode-font-family);
    font-weight: var(--vscode-font-weight);
    font-size: var(--vscode-font-size);
    }

    /* width */
    ::-webkit-scrollbar {
    width: 10px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
    background: rgba(121, 121, 121, 0.1);
    }
    
    /* Handle */
    ::-webkit-scrollbar-thumb {
    background: var(--vscode-scrollbarSlider-background);
    }

    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
    background: var(--vscode-scrollbarSlider-activeBackground);
    }

    body {
    background-color: var(--vscode-editor-background);
    }

    .parent {
    width: var(--search-box-width);
    position: relative;
    }

    .search-box {
    width: var(--search-box-width);
    height: 20px;
    padding: 2px 6px;
    background-color: var(--vscode-dropdown-background);
    color: var(--vscode-input-foreground);
    border: 1px solid;
    border-radius: 2px;
    border-color: var(--vscode-dropdown-background);
    }

    .search-box:focus {
    outline-color: var(--vscode-focusBorder);
    outline-width: 1px;
    outline-style: solid;
    outline-offset: -1px;
    }

    .option-box {
    max-height: 0px;
    height: 200px;
    overflow: hidden;
    overflow-x: hidden;
    overflow-y: scroll;
    overscroll-behavior: none;
    transition: max-height 0.2s ease-out;
    background-color: var(--vscode-dropdown-background);
    width: calc(var(--search-box-width) + 14px);
    position: absolute;
    cursor: pointer;
    z-index: 2;
    }

    .option-item {
    width: var(--search-box-width);
    height: 18px;
    color: var(--vscode-input-foreground);
    padding: 2px 2px 2px 2px;
    position: absolute;
    }

    .option-item:hover {
    background-color: var(--vscode-list-activeSelectionBackground);
    outline-color: var(--vscode-focusBorder);
    outline-width: 1px;
    outline-style: solid;
    outline-offset: -1px;
    }

    .option-hover {
    background-color: var(--vscode-list-activeSelectionBackground);
    outline-color: var(--vscode-focusBorder);
    outline-width: 1px;
    outline-style: solid;
    outline-offset: -1px;
    }

    .option-placeholder {
    height: 10px;
    width: 10px;
    pointer-events: none;
    position: absolute;
    }

    .codicon {
    color: var(--vscode-input-foreground);
    position: absolute;
    /* pointer-events: none; */
    cursor: pointer;
    top: 0;
    bottom: 0;
    right: -6px;
    margin: auto;
    height: 16px;
    width: 16px;
    }
  `;
}
