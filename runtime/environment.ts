import type { RuntimeVal } from "./values";

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeVal>;

  constructor(parentEnv?: Environment) {
    this.parent = parentEnv;
    this.variables = new Map();
  }

  public declareVar(varName: string, value: RuntimeVal): RuntimeVal {
    if (this.variables.has(varName)) {
      throw `Cannot declare variable ${varName} as it is already defined`;
    }

    this.variables.set(varName, value);

    return value;
  }

  public assignVar(varName: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varName);

    env.variables.set(varName, value);

    return value;
  }

  public lookupVar(varName: string): RuntimeVal {
    const env = this.resolve(varName);

    return env.variables.get(varName)!;
  }

  public resolve(varName: string): Environment {
    if (this.variables.has(varName)) {
      return this;
    }

    if (this.parent == undefined) {
      throw `Cannot resolve ${varName} as it does not exist in this and parent scopes`;
    }

    return this.parent.resolve(varName);
  }
}
