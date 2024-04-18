import type {
  FunctionDeclaration,
  Program,
  VarDeclaration,
} from "../../frontend/ast";
import type Environment from "../environment";
import { evaluate } from "../interpreter";
import { type RuntimeVal, MK_NULL, type FunctionVal } from "../values";

export function evaluateProgram(
  program: Program,
  env: Environment
): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL();

  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
  }

  return lastEvaluated;
}

export function evaluateVarDeclaration(
  declaration: VarDeclaration,
  env: Environment
): RuntimeVal {
  return env.declareVar(
    declaration.identifier,
    declaration.value ? evaluate(declaration.value, env) : MK_NULL(),
    declaration.constant
  );
}

export function evaluateFunctionDeclaration(
  declaration: FunctionDeclaration,
  env: Environment
): RuntimeVal {
  const func: FunctionVal = {
    type: "function",
    name: declaration.name,
    parameters: declaration.parameters,
    declarationEnv: env,
    body: declaration.body,
  };

  return env.declareVar(declaration.name, func, true);
}
