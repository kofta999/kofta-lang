import type {
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  Identifier,
  ObjectLiteral,
} from "../../frontend/ast";
import type Environment from "../environment";
import { evaluate } from "../interpreter";
import {
  type NumberVal,
  type RuntimeVal,
  MK_NULL,
  type ObjectVal,
  type StringVal,
  type NativeFnVal,
} from "../values";

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
  } else if (
    leftHandSide.type === "string" &&
    rightHandSide.type === "string" &&
    binOp.operator === "+"
  ) {
    return {
      type: "string",
      value:
        (leftHandSide as StringVal).value + (rightHandSide as StringVal).value,
    } as StringVal;
  }

  return MK_NULL();
}

export function evaluateIdentifier(
  ident: Identifier,
  env: Environment
): RuntimeVal {
  return env.lookupVar(ident.symbol);
}

export function evaluateAssignment(
  { assignee, value }: AssignmentExpr,
  env: Environment
): RuntimeVal {
  if (assignee.kind !== "Identifier") {
    throw `Invalid left hand side inside assignment expression ${JSON.stringify(
      assignee
    )}`;
  }

  return env.assignVar((assignee as Identifier).symbol, evaluate(value, env));
}

export function evaluateObjectExpr(
  obj: ObjectLiteral,
  env: Environment
): RuntimeVal {
  const object: ObjectVal = { type: "object", properties: new Map() };

  for (const { key, value } of obj.properties) {
    // Deals with the shorthand syntax { foo } so its gonna search the env for foo
    const runtimeVal = value ? evaluate(value, env) : env.lookupVar(key);

    object.properties.set(key, runtimeVal);
  }

  return object;
}

export function evaluateCallExpr(expr: CallExpr, env: Environment): RuntimeVal {
  const args = expr.args.map((arg) => evaluate(arg, env));
  const fn = evaluate(expr.callee, env);

  if (fn.type !== "nativeFn") {
    throw "Cannot call a value that is not a function: " + JSON.stringify(fn);
  }

  return (fn as NativeFnVal).call(args, env);
}
