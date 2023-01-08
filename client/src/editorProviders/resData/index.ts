import { ResData } from "./resData";
import { VarTable } from "./varTable";
import { Are } from "./are";
import { Git } from "./git";
import { Utd } from "./utd";
import { Utt } from "./utt";
import { Utw } from "./utw";
import { Uts } from "./uts";
import { Ute } from "./ute";
import { Utm } from "./utm";
import { Uti } from "./uti";
import { Utp } from "./utp";
import { Utc } from "./utc";
import { EditorTypes } from "../../api/types";

export { ResData, VarTable, Are, Git, Utd, Utt, Utw, Uts, Ute, Utm, Uti, Utc, Utp };

export function createResData(content: any): ResData {
  const type = getEditorType(content.resName);
  switch (type) {
    case EditorTypes.ARE:
      return new Are(content);
    case EditorTypes.GIT:
      return new Git(content);
    case EditorTypes.UTD:
      return new Utd(content);
    case EditorTypes.UTT:
      return new Utt(content);
    case EditorTypes.UTW:
      return new Utw(content);
    case EditorTypes.UTS:
      return new Uts(content);
    case EditorTypes.UTE:
      return new Ute(content);
    case EditorTypes.UTM:
      return new Utm(content);
    case EditorTypes.UTI:
      return new Uti(content);
    case EditorTypes.UTP:
      return new Utp(content);
    case EditorTypes.UTC:
      return new Utc(content);
    default:
      throw new Error("Unknown Editor Type");
  }

  function getEditorType(resName: string): EditorTypes {
    const resType = resName.split(".")[1];
    switch (resType) {
      case "are":
        return EditorTypes.ARE;
      case "git":
        return EditorTypes.GIT;
      case "utc":
        return EditorTypes.UTC;
      case "utd":
        return EditorTypes.UTD;
      case "utp":
        return EditorTypes.UTP;
      case "utt":
        return EditorTypes.UTT;
      case "utw":
        return EditorTypes.UTW;
      case "uts":
        return EditorTypes.UTS;
      case "ute":
        return EditorTypes.UTE;
      case "utm":
        return EditorTypes.UTM;
      case "uti":
        return EditorTypes.UTI;
    }

    throw new Error("Unknown Editor Type");
  }
}
