import type { BinaryExpr, Identifier } from "../../frontend/ast";
import type Environment from "../environment";
import { evaluate } from "../interpreter";
import { type NumberVal, type RuntimeVal, MK_NULL } from "../values";

function evaluateNumericBinaryExpr(
  lhs: NumberVal,
  rhs: NumberVal,
  operator: string
): NumberVal {
  let result = 0;

  switch (operator) {
    case "+":
      result = lhs.value + rhs.value;
      break;
    case "-":
      result = lhs.value - rhs.value;
      break;
    case "*":
      result = lhs.value * rhs.value;
      break;
    case "/":
      // TODO: Division by zero checks
      result = lhs.value / rhs.value;
      break;
    case "%":
      result = lhs.value % rhs.value;
      break;
  }
  return { type: "number", value: result };
}

export function evaluateBinaryExpr(
  binOp: BinaryExpr,
  env: Environment
): RuntimeVal {
  const leftHandSide = evaluate(binOp.left, env);
  const rightHandSide = evaluate(binOp.right, env);

  if (leftHandSide.type === "number" && rightHandSide.type === "number") {
    return evaluateNumericBinaryExpr(
      leftHandSide as NumberVal,
      rightHandSide as NumberVal,
      binOp.operator
    );
  }

  return MK_NULL();
}

export function evaluateIdentifier(ident: Identifier, env: Environment) {
  return env.lookupVar(ident.symbol);
}
