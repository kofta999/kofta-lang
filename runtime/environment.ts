import { MK_BOOL, MK_NULL, type RuntimeVal } from "./values";

function setupScope(env: Environment) {
  env.declareVar("true", MK_BOOL(true), true);
  env.declareVar("false", MK_BOOL(false), true);
  env.declareVar("null", MK_NULL(), true);
}

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeVal>;
  private constants: Set<string>;

  constructor(parentEnv?: Environment) {
    const global = !!!parentEnv;
    this.parent = parentEnv;
    this.variables = new Map();
    this.constants = new Set();

    if (global) setupScope(this);
  }

  public declareVar(
    varName: string,
    value: RuntimeVal,
    isConstant: boolean
  ): RuntimeVal {
    if (this.variables.has(varName)) {
      throw `Cannot declare variable ${varName} as it is already defined`;
    }

    this.variables.set(varName, value);

    if (isConstant) this.constants.add(varName);

    return value;
  }

  public assignVar(varName: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varName);

    // Cannot reassign value to a constant
    if (env.constants.has(varName))
      throw `Cannot reassign to variable ${varName} as it was declared using const keyword`;

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
