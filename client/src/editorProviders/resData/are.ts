import { Tilesets } from "../../components/lists";

export class Are {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  public getField(field: string) {
    if (field === "Size") {
      const width = this._data.resData[1].Width[1];
      const height = this._data.resData[1].Height[1];
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      return [10, width.toString() + "x" + height.toString()];
    }
    if (field === "Tileset") {
      const resref = this._data.resData[1].Tileset[1];
      const tileset = Tilesets.find((t) => t.value === resref);

      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      return [10, resref + " - " + tileset?.label];
    }

    return this._data.resData[1][field];
  }

  public setField(field: string, value: string) {
    this._data.resData[1][field][1] = value;
  }

  public get editableFields() {
    const fields = this._data.extraData.colorFields.concat(this._data.editableFields);
    fields.push("Tileset");
    fields.push("Size");
    return fields;
  }
}

// res_Name
// res_Tag
// res_Tileset
// res_Size
// res_DayNightCycle
// res_Flags_SunShadows
// res_Flags_MoonShadows
// res_SunAmbientColor
// res_SunDiffuseColor
// res_SunFogAmount
// res_SunFogColor
// res_MoonAmbientColor
// res_MoonDiffuseColor
// res_MoonFogAmount
// res_MoonFogColor
// res_FogClipDistance
// res_ShadowOp
// res_ShadowOpacity
// res_WeatherWindPower
// res_WeatherSnowPercentage
// res_WeatherRainPercentage
// res_WeatherLightningPercentage
// res_Skybox
// res_Flags_NoRest
// res_Flags_Interior
// res_Flags_Underground
// res_Flags_Natural
// res_CheckModifierListen
// res_CheckModifierSpot
// res_PvP
// res_LoadScreen

// SCRIPTS
