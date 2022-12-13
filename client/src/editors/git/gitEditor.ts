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

function BindFields(content: any) {
  const AmbientSndDay = content.resData[1].AreaProperties[1][1].AmbientSndDay[1];
  document.getElementById("res_AmbientSndDay")?.setAttribute("current-value", AmbientSndDay);

  const AmbientSndDayVol = content.resData[1].AreaProperties[1][1].AmbientSndDayVol[1];
  document.getElementById("res_AmbientSndDayVol")?.setAttribute("value", AmbientSndDayVol);

  const MusicDay = content.resData[1].AreaProperties[1][1].MusicDay[1];
  document.getElementById("res_MusicDay")?.setAttribute("current-value", MusicDay);

  const AmbientSndNight = content.resData[1].AreaProperties[1][1].AmbientSndNight[1];
  document.getElementById("res_AmbientSndNight")?.setAttribute("current-value", AmbientSndNight);

  const AmbientSndNightVol = content.resData[1].AreaProperties[1][1].AmbientSndNitVol[1];
  document.getElementById("res_AmbientSndNitVol")?.setAttribute("value", AmbientSndNightVol);

  const MusicNight = content.resData[1].AreaProperties[1][1].MusicNight[1];
  document.getElementById("res_MusicNight")?.setAttribute("current-value", MusicNight);

  const MusicBattle = content.resData[1].AreaProperties[1][1].MusicBattle[1];
  document.getElementById("res_MusicBattle")?.setAttribute("current-value", MusicBattle);

  const MusicDelay = content.resData[1].AreaProperties[1][1].MusicDelay[1];
  document.getElementById("res_MusicDelay")?.setAttribute("value", MusicDelay);

  const EnvAudio = content.resData[1].AreaProperties[1][1].EnvAudio[1];
  document.getElementById("res_EnvAudio")?.setAttribute("current-value", EnvAudio);

  const varTable = content.resData[1].VarTable[1];
  document.getElementById("res_variableTable")?.setAttribute("current-value", JSON.stringify(varTable));
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
// SCRIPTS

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
// res_Flags_NoRest
// res_Flags_Interior
// res_Flags_Underground
// res_Flags_Natural
// res_CheckModifierListen
// res_CheckModifierSpot
// res_PvP
// res_LoadScreen

// VARIABLES
