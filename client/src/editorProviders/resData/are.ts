import { Tilesets } from "../../components/lists";

export class Are {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  // We return the fields as GFF fields so resData provider can handle some general cases
  // that would apply to all resources
  public getField(field: string) {
    switch (field) {
      case "Size": {
        const width = this._data.resData[1].Width[1];
        const height = this._data.resData[1].Height[1];
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        return [10, width.toString() + "x" + height.toString()];
      }
      case "Tileset": {
        const resref = this._data.resData[1].Tileset[1];
        const tileset = Tilesets.find((t) => t.value === resref);

        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        return [10, resref + " - " + tileset?.label];
      }
      case "Interior": {
        return [4, this._data.resData[1].Flags[1] & 1];
      }
      case "Underground": {
        return [4, this._data.resData[1].Flags[1] & 2];
      }
      case "Natural": {
        return [4, this._data.resData[1].Flags[1] & 4];
      }
      case "DayNightCycle": {
        return [0, this._data.resData[1].DayNightCycle[1] ? 1 : this._data.resData[1].IsNight[1] ? 3 : 2];
      }
      case "SunAmbientColor":
      case "SunDiffuseColor":
      case "SunFogColor":
      case "MoonAmbientColor":
      case "MoonDiffuseColor":
      case "MoonFogColor": {
        const bgr: number = this._data.resData[1][field][1];

        return [4, this.BGRtoRGB(bgr)];
      }
      default:
        return this._data.resData[1][field];
    }
  }

  public setField(field: string, value: string) {
    switch (field) {
      case "Interior": {
        if (value) {
          this._data.resData[1].Flags[1] |= 1;
        } else {
          this._data.resData[1].Flags[1] &= ~1;
        }
        break;
      }
      case "Underground": {
        if (value) {
          this._data.resData[1].Flags[1] |= 2;
        } else {
          this._data.resData[1].Flags[1] &= ~2;
        }
        break;
      }
      case "Natural": {
        if (value) {
          this._data.resData[1].Flags[1] |= 4;
        } else {
          this._data.resData[1].Flags[1] &= ~4;
        }
        break;
      }
      case "SunAmbientColor":
      case "SunDiffuseColor":
      case "SunFogColor":
      case "MoonAmbientColor":
      case "MoonDiffuseColor":
      case "MoonFogColor": {
        this._data.resData[1][field][1] = this.RGBtoBGR(value);
        break;
      }
      default: {
        this._data.resData[1][field][1] = value;
      }
    }
  }

  public get editableFields() {
    const fields = this._data.extraData.colorFields.concat(this._data.editableFields);
    fields.push("Tileset");
    fields.push("Size");
    fields.push("Interior");
    fields.push("Underground");
    fields.push("Natural");
    fields.push("DayNightCycle");
    fields.push("SunShadows");
    fields.push("MoonShadows");
    fields.push("NoRest");
    return fields;
  }

  private BGRtoRGB(bgr: number): string {
    const hex = bgr.toString(16).padStart(6, "0");
    const r = hex.substr(4, 2);
    const g = hex.substr(2, 2);
    const b = hex.substr(0, 2);
    return "#" + r + g + b;
  }

  private RGBtoBGR(rgb: string): number {
    const r = parseInt(rgb.substr(1, 2), 16);
    const g = parseInt(rgb.substr(3, 2), 16);
    const b = parseInt(rgb.substr(5, 2), 16);
    return b * 256 * 256 + g * 256 + r;
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
