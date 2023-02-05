import { Utc } from "../editorProviders/resData";
import { CreatureAppearances } from "./lists";

export class nwnCreatureAppearance extends HTMLElement {
  _content!: Utc;

  _baseApprField!: HTMLElement;

  _wingField!: HTMLElement;
  _tailField!: HTMLElement;
  _dynAppearAccrd!: HTMLElement;
  _colorAccrd!: HTMLElement;

  constructor() {
    super();

    this.innerHTML = this._html;
  }

  public Init(content: Utc, baseApprField: HTMLElement) {
    this._content = content;
    this._baseApprField = baseApprField;

    const wingDiv = (this.querySelector("#res_Wings_New") as HTMLElement).parentElement?.parentElement?.parentElement;
    const tailDiv = (this.querySelector("#res_Tail_New") as HTMLElement).parentElement?.parentElement?.parentElement;
    if (wingDiv) this._wingField = wingDiv;
    if (tailDiv) this._tailField = tailDiv;

    this._dynAppearAccrd = this.querySelector("#CreatureDynamicAppearance") as HTMLElement;
    this._colorAccrd = this.querySelector("#CreatureColors") as HTMLElement;

    baseApprField.addEventListener("change", this.HandleAppearanceChange.bind(this));

    this.UpdateAppearanceFields();
  }

  public HandleAppearanceChange() {
    this.UpdateAppearanceFields();
  }

  private UpdateAppearanceFields() {
    const appearance = this._content.getField("Appearance_Type").toString();
    const modelType = CreatureAppearances.find((x) => x.value === appearance)?.modelType ?? "S";

    this._wingField.style.display = "none";
    this._tailField.style.display = "none";
    this._dynAppearAccrd.style.display = "none";
    this._colorAccrd.style.display = "none";

    // Part body model
    if (modelType.includes("P")) {
      this._wingField.style.display = "block";
      this._tailField.style.display = "block";
      this._dynAppearAccrd.style.display = "block";
      this._colorAccrd.style.display = "block";
    }

    // Wings
    if (modelType.includes("W")) {
      this._wingField.style.display = "block";
    }

    // Tails
    if (modelType.includes("T")) {
      this._tailField.style.display = "block";
    }
  }

  private readonly _html: string = `
<sp-accordion-item label="Appearance">
<nwn-row label="Appearance">
  <nwn-drop-down-large id="res_Appearance_Type" listRef="CreatureAppearances"></nwn-drop-down-large>
</nwn-row>
<nwn-drop-down id="res_FootstepType" label="Footstep Sound" listRef="FootstepSound"></nwn-drop-down>
<nwn-drop-down id="res_Gender" label="Gender" listRef="Gender"></nwn-drop-down>
<nwn-number-field id="res_Wings_New" label="Wings" unit="byte" style="display: none;"></nwn-number-field>
<nwn-number-field id="res_Tail_New" label="Tail" unit="byte" style="display: none;"></nwn-number-field>
</sp-accordion-item>
<sp-accordion-item id="CreatureDynamicAppearance" label="Dynamic Appearance" style="display: none;">
<nwn-number-field id="res_Phenotype" label="Phenotype" unit="byte"></nwn-number-field>
<nwn-number-field id="res_Appearance_Head" label="Head" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_Neck" label="Neck" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_RShoul" label="Right Shoulder" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_LShoul" label="Left Shoulder" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_RBicep" label="Right Bicep" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_LBicep" label="Left Bicep" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_RFArm" label="Right Forearm" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_LFArm" label="Left Forearm" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_RHand" label="Right Hand" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_LHand" label="Left Hand" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_Torso" label="Torso" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_Belt" label="Belt" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_Pelvis" label="Pelvis" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_RThigh" label="Right Thigh" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_LThigh" label="Left Thigh" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_RShin" label="Right Shin" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_LShin" label="Left Shin" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_RFoot" label="Right Foot" unit="byte"></nwn-number-field>
<nwn-number-field id="res_BodyPart_LFoot" label="Left Foot" unit="byte"></nwn-number-field>
</sp-accordion-item>
<sp-accordion-item id="CreatureColors" label="Colors" style="display: none;">
<nwn-number-field id="res_Color_Hair" label="Hair" unit="byte"></nwn-number-field>
<nwn-number-field id="res_Color_Skin" label="Skin" unit="byte"></nwn-number-field>
<nwn-number-field id="res_Color_Tattoo1" label="Tattoo 1" unit="byte"></nwn-number-field>
<nwn-number-field id="res_Color_Tattoo2" label="Tattoo 2" unit="byte"></nwn-number-field>
</sp-accordion-item>
`;
}
