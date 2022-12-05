import {
  NumberField as FoundationNumberField,
  numberFieldTemplate as template,
  NumberFieldOptions,
} from "@microsoft/fast-foundation";
import { numberFieldStyles as styles } from "./number-field.styles";

/**
 * The Visual Studio Code number field class.
 *
 * @public
 */
export class NumberField extends FoundationNumberField {
  /**
   * Component lifecycle method that runs when the component is inserted
   * into the DOM.
   *
   * @internal
   */
  public connectedCallback() {
    super.connectedCallback();
    if (this.textContent) {
      this.setAttribute("aria-label", this.textContent);
    } else {
      // Describe the generic component if no label is provided
      this.setAttribute("aria-label", "Text field");
    }
  }
}
