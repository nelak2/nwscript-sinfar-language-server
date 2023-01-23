import { Uti } from "../editorProviders/resData";

export class nwnItemAppearance extends HTMLElement {
  _content!: Uti;

  _baseItemField!: HTMLElement;

  _accrdSimple!: HTMLElement;
  _accrdWeapon!: HTMLElement;
  _accrdArmor!: HTMLElement;
  _accrdColor!: HTMLElement;

  constructor() {
    super();

    this.innerHTML = this._html;
  }

  public Init(content: Uti, baseItemField: HTMLElement) {
    this._content = content;
    this._baseItemField = baseItemField;

    this._accrdSimple = this.querySelector("#ItemAppearanceSimple") as HTMLElement;
    this._accrdWeapon = this.querySelector("#ItemAppearanceNormal") as HTMLElement;
    this._accrdArmor = this.querySelector("#ItemAppearanceArmor") as HTMLElement;
    this._accrdColor = this.querySelector("#ItemAppearanceColor") as HTMLElement;

    baseItemField.addEventListener("change", this.HandleBaseItemChange.bind(this));

    this.UpdateAppearanceFields();
  }

  private HandleBaseItemChange(e: Event) {
    this.UpdateAppearanceFields();
  }

  private UpdateAppearanceFields() {
    const modelType = this._content.getField("AppearanceType");

    this._accrdSimple.style.display = "none";
    this._accrdWeapon.style.display = "none";
    this._accrdArmor.style.display = "none";
    this._accrdColor.style.display = "none";

    if (modelType === 1 || modelType === 3) {
      this._accrdColor.style.display = "block";
    }

    if (modelType === 1 || modelType === 0) {
      this._accrdSimple.style.display = "block";
    }

    if (modelType === 2) {
      this._accrdWeapon.style.display = "block";
    }

    if (modelType === 3) {
      this._accrdArmor.style.display = "block";
    }
  }

  private readonly _html: string = `
<sp-accordion-item id="ItemAppearanceSimple" label="Simple Appearance" style="display: none;">
  <nwn-number-field id="res_simple_appearance" label="Appearance" unit="byte"></nwn-number-field>
</sp-accordion-item>
<sp-accordion-item id="ItemAppearanceNormal" label="Item Appearance" style="display: none;">
  <nwn-number-field id="res_ModelPart1" label="Top" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ModelPart2" label="Middle" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ModelPart3" label="Bottom" unit="byte"></nwn-number-field>
</sp-accordion-item>
<sp-accordion-item id="ItemAppearanceArmor" label="Armor Appearance" style="display: none;">
  <nwn-number-field id="res_ArmorPart_RShoul" label="Right Shoulder" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ArmorPart_LShoul" label="Left Shoulder" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ArmorPart_RBicep" label="Right Bicep" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ArmorPart_LBicep" label="Left Bicep" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ArmorPart_RFArm" label="Right Forearm" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ArmorPart_LFArm" label="Left Forearm" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ArmorPart_RHand" label="Right Hand" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ArmorPart_LHand" label="Left Hand" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ArmorPart_Torso" label="Torso" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ArmorPart_Belt" label="Belt" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ArmorPart_Pelvis" label="Pelvis" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ArmorPart_RThigh" label="Right Thigh" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ArmorPart_LThigh" label="Left Thigh" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ArmorPart_RShin" label="Right Shin" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ArmorPart_LShin" label="Left Shin" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ArmorPart_RFoot" label="Right Foot" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ArmorPart_LFoot" label="Left Foot" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_ArmorPart_Robe" label="Robe" unit="byte"></nwn-number-field>
</sp-accordion-item>
<sp-accordion-item id="ItemAppearanceColor" label="Colors" style="display: none;">
  <nwn-number-field id="res_Cloth1Color" label="Cloth 1" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_Cloth2Color" label="Cloth 2" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_Leather1Color" label="Leather 1" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_Leather2Color" label="Leather 2" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_Metal1Color" label="Metal 1" unit="byte"></nwn-number-field>
  <nwn-number-field id="res_Metal2Color" label="Metal 1" unit="byte"></nwn-number-field>
</sp-accordion-item>
`;
}

/*  Different items have different number of appearance fields
    Some only have one. Others have 3
        <nwn-number-field id="res_ModelPart1" label="Top" unit="byte"></nwn-number-field>
        <nwn-number-field id="res_ModelPart2" label="Middle" unit="byte"></nwn-number-field>
        <nwn-number-field id="res_ModelPart3" label="Bottom" unit="byte"></nwn-number-field>
*/
