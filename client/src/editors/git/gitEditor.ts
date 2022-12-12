import { InitializeNWNControls } from "../../components";

const vscode = acquireVsCodeApi();
InitializeNWNControls();

let content;

window.addEventListener("load", main);
window.addEventListener("message", InboundMessageHandler);

function main() {
  // requestScriptFields("git");
  const testButton = document.getElementById("testButton");
  if (testButton) {
    testButton.addEventListener("click", handleTestClick);
  }
}

// function requestScriptFields(resourceType: string) {
//   vscode.postMessage({ command: "getScriptFields", text: resourceType });
//   console.log("requestScriptFields");
// }

function handleTestClick() {
  // const state: any = vscode.getState();
  const testButton = document.getElementById("testButton");
  if (testButton) {
    testButton.textContent = "Aha!";
  }
  vscode.postMessage({
    command: "getScriptFields",
    text: "git",
  });
}

// let content: any;
function InboundMessageHandler(event: any) {
  const message = event.data;
  if (event.type === "message" && message) {
    const messageType = message.type;
    const test3 = document.body.appendChild(document.createElement("p"));
    switch (messageType) {
      case "update":
        try {
          content = JSON.parse(message.text);
          BindFields(content);
          test3.innerText = "Data: " + JSON.stringify(content);
        } catch {
          test3.innerText = "Data: failed to parse";
        }
        break;
      // case "scriptFields":
      //   generateScriptFields(message.scriptFields);
      //   break;
    }
  }
}

type Area = {
  resName: string;
  erfId: number;
  resData: [];
  langId: string;
  resResRef: string;
  editableFields: any;
  extraData: any;
};

type ResData = {
  AreaProperties: [[AreaProperties]];
  ["Creature List"]: any;
  ["Door List"]: any;
  ["Encounter List"]: any;
  List: any;
  ["Placeable List"]: any;
  SoundList: any;
  StoreList: any;
  TriggerList: any;
  VarTable: any;
  WaypointList: any;
};

type AreaProperties = {
  AmbientSndDay: [];
  AmbientSndDayVol: [];
  AmbientSndNight: [];
  AmbientSndNitVol: [];
  EnvAudio: [];
  MusicBattle: [];
  MusicDay: [];
  MusicDelay: [];
  MusicNight: [];
};

function BindFields(content: Area) {
  const resdata = content.resData[1] as unknown as ResData;
  const areaProp = resdata.AreaProperties.at(1)?.at(1) as AreaProperties;

  console.clear();
  console.log(areaProp.AmbientSndDay[1]);
}

// res_Name
// res_Tag
// res_TilesetResRef
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
// res_AmbientSndDay
// res_AmbientSndDayVol
// res_MusicDay
// res_AmbientSndNight
// res_AmbientSndNightVol
// res_MusicNight
// res_MusicBattle
// res_MusicDelay
// res_EnvAudio
// res_Flags_NoRest
// res_Flags_Interior
// res_Flags_Underground
// res_Flags_Natural
// res_CheckModifierListen
// res_CheckModifierSpot
// res_PvP
// res_LoadScreen
// SCRIPTS
// VARIABLES
