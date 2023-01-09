import { ResData, VarTable } from ".";

export class Uts extends ResData {
  private readonly _vartable: VarTable;
  private readonly _soundList: SoundList;

  constructor(resdata: any) {
    super(resdata);
    this._vartable = new VarTable(this._data);
    this._soundList = new SoundList(this._data);
  }

  public get editableFields() {
    const fields = this._data.editableFields;

    for (let i = 0; i < 24; i++) {
      fields.push("hour_" + i.toString());
    }

    return this._data.editableFields;
  }

  public getField(field: string) {
    if (field.startsWith("hour_")) {
      const hour = parseInt(field.split("_")[1]);
      if (this.data.resData[1].Hours[1] & (1 << hour)) {
        return 1;
      } else {
        return 0;
      }
    }
    return this.readField(this.data.resData[1][field]);
  }

  public setField(field: string, value: any) {
    if (field.startsWith("hour_")) {
      const hour = parseInt(field.split("_")[1]);
      if (value === 1) {
        this.data.resData[1].Hours[1] |= 1 << hour;
        return;
      } else {
        this.data.resData[1].Hours[1] &= ~(1 << hour);
        return;
      }
    }

    this.data.resData[1][field][1] = this.writeField(value, this.data.resData[1][field][0]);
  }

  public get VarTable(): VarTable {
    return this._vartable;
  }

  public get SoundList() {
    return this._soundList;
  }
}

class SoundList {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  /**
   * Get the list of sounds
   * @returns the list of sounds
   * @remarks duplicates are allowed
   * @remarks the list is in the order it exists in the file
   */
  public getSoundList(): string[] {
    const sounds: string[] = [];

    for (const sound of this._data.resData[1].Sounds[1]) {
      sounds.push(sound[1].Sound[1]);
    }

    return sounds;
  }

  /**
   * Add a new sound to the list
   * @param sound new sound to add (resref)
   * @returns the sound if it was added
   * @remarks duplicates are allowed
   */
  public addSound(sound: string): string | undefined {
    this._data.resData[1].Sounds[1].push([0, { Sound: [11, sound] }]);
    return sound;
  }

  /**
   * Update a sound in the list
   * @param index index of the sound to update
   * @param newSound new sound to update to (resref)
   * @returns the old sound if it was found, undefined otherwise
   */
  public updateSound(index: number, newSound: string): string | undefined {
    let oldSound: string;
    try {
      oldSound = this._data.resData[1].Sounds[1][index][1].Sound[1];
    } catch (e) {
      return undefined;
    }

    this._data.resData[1].Sounds[1][index] = [0, { Sound: [11, newSound] }];
    return oldSound;
  }

  /**
   * Get a sound from the list
   * @param index index of the sound to get
   * @returns the sound if it was found, undefined otherwise
   */
  public getSound(index: number): string | undefined {
    try {
      return this._data.resData[1].Sounds[1][index][1].Sound[1];
    } catch (e) {
      return undefined;
    }
  }

  /**
   * Delete a sound from the list
   * @param index: index of the sound to delete
   * @returns the sound if it was deleted, undefined otherwise
   * @remarks if the sound is not found, the list is not modified
   */
  public deleteSound(index: number): string | undefined {
    let oldSound: string;
    try {
      oldSound = this._data.resData[1].Sounds[1][index][1].Sound[1];
    } catch (e) {
      return undefined;
    }

    this._data.resData[1].Sounds[1].splice(index, 1);
    return oldSound;
  }
}
