import { Variable, VariableType } from "../../api/types";

export class VarTable {
  private readonly _data: any;
  constructor(resdata: any) {
    this._data = resdata;
  }

  public get VarTable() {
    return this._data[1].VarTable;
  }

  public set VarTable(value) {
    this._data[1].VarTable = value;
  }

  // Get the raw entry from the VarTable
  private getVarTableEntry(index: number): any {
    if (index < 0 || index >= this._data[1].VarTable.length) {
      throw new Error(`Index ${index} is out of bounds`);
    }
    return this._data[1].VarTable[index];
  }

  // Get the variable object from the VarTable
  // returns undefined if entry is not found
  public getVariable(index: number): Variable | undefined {
    try {
      const entry = this.getVarTableEntry(index);
      return {
        Name: entry[1].Name[1],
        Type: VarTable.getNWNVariableType(entry[1].Type[1]),
        Value: entry[1].Value[1],
      };
    } catch (e) {
      return undefined;
    }
  }

  // Update the variable at the given index
  // throws an error if the index is not found
  // returns the old variable or undefined if the index is not found
  public updateVariable(index: number, variable: Variable): Variable | undefined {
    try {
      const oldValue = this.getVariable(index);
      const entry = this.getVarTableEntry(index);

      // if the variable is not found do nothing and return undefined
      if (!oldValue) {
        return undefined;
      }

      entry[1].Name[1] = variable.Name;
      entry[1].Type[1] = VarTable.getNWNGFFType(variable.Type);
      entry[1].Value[1] = VarTable.formatValue(variable.Value, variable.Type);

      return oldValue;
    } catch (e) {
      throw new Error("Variable not found");
    }
  }

  public addVariable(variable: Variable) {
    throw new Error("Not implemented");
  }

  // Deletes the variable with the given name from the VarTable
  // and returns the deleted variable
  public deleteVariable(name: string): Variable | undefined {
    const oldValue = this.getVariableByName(name);

    if (oldValue) {
      this.VarTable[1] = this.VarTable[1].filter((variable: any) => variable[1].Name[1] !== name);
      return oldValue;
    }
    return undefined;
  }

  // Get the variable object from the VarTable by name
  public getVariableByName(name: string): Variable | undefined {
    for (let i = 0; i < this.VarTable[1].length; i++) {
      if (this.VarTable[1][i][1].Name[1] === name) {
        return this.getVariable(i);
      }
    }
  }

  // Return a list of variables from the raw VarTable
  public get List() {
    const list: Variable[] = [];
    for (const variable of this.VarTable[1]) {
      list.push({
        Name: variable[1].Name[1],
        Type: variable[1].Type[1],
        Value: variable[1].Value[1],
      });
    }
    return list;
  }

  // Validate a variable object
  // throws an error if the variable is invalid
  // checkNameExists: check if the variable name already exists
  private validateVariable(variable: Variable, checkNameExists = false) {
    if (variable.Name === "") {
      throw new Error("Variable name cannot be empty");
    }
    if (variable.Value === "") {
      throw new Error("Variable value cannot be empty");
    }

    // check variable name is valid
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable.Name)) {
      throw new Error("Variable name is invalid");
    }

    if (variable.Type === VariableType.Int && isNaN(parseInt(variable.Value as string))) {
      throw new Error("Variable value must be an integer");
    } else if (variable.Type === VariableType.Float && isNaN(parseFloat(variable.Value as string))) {
      throw new Error("Variable value must be a float");
    }

    if (checkNameExists) {
      for (let i = 0; i < this.VarTable[1].length; i++) {
        if (this.VarTable[1][i][1].Name[1] === variable.Name) {
          throw new Error("Variable name already exists");
        }
      }
    }
  }

  public validateAndFormatVariable(variable: Variable, checkNameExists = false): Variable {
    const newVariable = {
      Name: variable.Name,
      Type: variable.Type,
      Value: VarTable.formatValue(variable.Value, variable.Type),
    };
    this.validateVariable(newVariable, checkNameExists);
    return newVariable;
  }

  // convert from NWScript variable type to NWScript GFF type
  private static getNWNGFFType(varType: VariableType): number {
    if (varType === VariableType.Int) return 5;
    if (varType === VariableType.Float) return 8;
    if (varType === VariableType.String) return 10;

    return 10; // default to string
  }

  // convert from NWScript GFF type to NWScript variable type
  private static getNWNVariableType(gffType: number): VariableType {
    if (gffType === 5) return VariableType.Int;
    if (gffType === 8) return VariableType.Float;
    if (gffType === 10) return VariableType.String;

    return VariableType.String; // default to string
  }

  // format variable value
  public static formatValue(value: string | number, Type: VariableType): string | number {
    if (typeof value === "number") {
      return value;
    }

    if (Type === VariableType.Int) {
      return parseInt(value).toString();
    } else if (Type === VariableType.Float) {
      return parseFloat(value).toString();
    }
    return value;
  }
}

// public getVarTable() {
//   const variableArray = [];
//   for (const variable of this._variables) {
//     const name = [10, variable.Name];
//     const varType = [4, variable.Type];
//     const value = [this.getNWNGFFType(variable.Type), variable.Value];

//     const GFFElement = [0, { Name: name, Type: varType, Value: value }];

//     variableArray.push(GFFElement);
//   }

//   return [15, variableArray];
// }
