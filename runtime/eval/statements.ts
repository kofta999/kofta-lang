import type { Program, VarDeclaration } from "../../frontend/ast";
import type Environment from "../environment";
import { evaluate } from "../interpreter";
import { type RuntimeVal, MK_NULL } from "../values";

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
