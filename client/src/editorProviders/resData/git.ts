export class Git {
  private _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }
  // res_AmbientSndDay
  // res_AmbientSndDayVol
  // res_MusicDay
  // res_AmbientSndNight
  // res_AmbientSndNightVol
  // res_MusicNight
  // res_MusicBattle
  // res_MusicDelay
  // res_EnvAudio

  public get data() {
    return this._data;
  }

  public set data(value) {
    this._data = value;
  }

  public getField(field: string) {
    return this._data.resData[1].AreaProperties[1][1][field][1];
  }

  public setField(field: string, value: string) {
    this._data.resData[1].AreaProperties[1][1][field][1] = value;
  }

  public get AmbientSndDay() {
    return this._data.resData[1].AreaProperties[1][1].AmbientSndDay[1];
  }

  public set AmbientSndDay(value) {
    this._data.resData[1].AreaProperties[1][1].AmbientSndDay[1] = value;
  }

  public get AmbientSndDayVol() {
    return this._data.resData[1].AreaProperties[1][1].AmbientSndDayVol[1];
  }

  public set AmbientSndDayVol(value) {
    this._data.resData[1].AreaProperties[1][1].AmbientSndDayVol[1] = value;
  }

  public get MusicDay() {
    return this._data.resData[1].AreaProperties[1][1].MusicDay[1];
  }

  public set MusicDay(value) {
    this._data.resData[1].AreaProperties[1][1].MusicDay[1] = value;
  }

  public get AmbientSndNight() {
    return this._data.resData[1].AreaProperties[1][1].AmbientSndNight[1];
  }

  public set AmbientSndNight(value) {
    this._data.resData[1].AreaProperties[1][1].AmbientSndNight[1] = value;
  }

  public get AmbientSndNightVol() {
    return this._data.resData[1].AreaProperties[1][1].AmbientSndNightVol[1];
  }

  public set AmbientSndNightVol(value) {
    this._data.resData[1].AreaProperties[1][1].AmbientSndNightVol[1] = value;
  }

  public get MusicNight() {
    return this._data.resData[1].AreaProperties[1][1].MusicNight[1];
  }

  public set MusicNight(value) {
    this._data.resData[1].AreaProperties[1][1].MusicNight[1] = value;
  }

  public get MusicBattle() {
    return this._data.resData[1].AreaProperties[1][1].MusicBattle[1];
  }

  public set MusicBattle(value) {
    this._data.resData[1].AreaProperties[1][1].MusicBattle[1] = value;
  }

  public get MusicDelay() {
    return this._data.resData[1].AreaProperties[1][1].MusicDelay[1];
  }

  public set MusicDelay(value) {
    this._data.resData[1].AreaProperties[1][1].MusicDelay[1] = value;
  }

  public get EnvAudio() {
    return this._data.resData[1].AreaProperties[1][1].EnvAudio[1];
  }

  public set EnvAudio(value) {
    this._data.resData[1].AreaProperties[1][1].EnvAudio[1] = value;
  }
}
