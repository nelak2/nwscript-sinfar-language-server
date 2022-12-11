import fs from "fs";
import * as vscode from "vscode";
import { promisify } from "util";

export type Event = {
  resource: string;
  events: string[];
};

export type Music = {
  value: string;
  description: string;
};

export type AmbientSound = {
  value: string;
  description: string;
};

export type Environmental = {
  value: string;
  description: string;
};

export class ResourcesAPI {
  constructor(private readonly context: vscode.ExtensionContext) {
    this._context = context;
  }

  private readonly _context;
  private _events: Event[] = [];
  private _music: Music[] = [];
  private _ambientSounds: AmbientSound[] = [];
  private _environmental: Environmental[] = [];

  public async Initialize() {
    const promiseArray = [];
    promiseArray.push(this.loadEvents());
    promiseArray.push(this.loadMusic());
    promiseArray.push(this.loadAmbientSounds());
    promiseArray.push(this.loadEnvironmental());

    await Promise.all(promiseArray);
  }

  private async loadMusic() {
    let music: Music[] = [];
    try {
      const res = await this.loadResource("client/out/resources/music.json");
      music = JSON.parse(res) as Music[];
    } catch (error) {
      console.error(error);
    }
    this._music = music;
  }

  private async loadAmbientSounds() {
    let ambientSounds: AmbientSound[] = [];
    try {
      const res = await this.loadResource("client/out/resources/ambientsound.json");
      ambientSounds = JSON.parse(res) as AmbientSound[];
    } catch (error) {
      console.error(error);
    }
    this._ambientSounds = ambientSounds;
  }

  private async loadEnvironmental() {
    let environmental: Environmental[] = [];
    try {
      const res = await this.loadResource("client/out/resources/environmental.json");
      environmental = JSON.parse(res) as Environmental[];
    } catch (error) {
      console.error(error);
    }
    this._environmental = environmental;
  }

  private async loadEvents() {
    let events: Event[] = [];
    try {
      const res = await this.loadResource("client/out/resources/events.json");
      events = JSON.parse(res) as Event[];
    } catch (error) {
      console.error(error);
    }
    this._events = events;
  }

  private async loadResource(file: string): Promise<any> {
    const _fs = promisify(fs.readFile);
    try {
      const res = await _fs(this._context.asAbsolutePath(file), "utf8");
      return res;
    } catch (error) {
      console.error(error);
    }
  }

  public getScriptFields(resourceType: string): string[] {
    const resource = this._events.find((x) => x.resource === resourceType);

    if (resource) {
      return resource.events;
    }
    return [];
  }

  public getMusic(): Music[] {
    return this._music;
  }

  public getAmbientSounds(): AmbientSound[] {
    return this._ambientSounds;
  }

  public getEnvironmental(): Environmental[] {
    return this._environmental;
  }
}
