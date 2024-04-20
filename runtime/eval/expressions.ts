import type {
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  Identifier,
  ObjectLiteral,
  ArithmeticOperator,
  ComparisonOperator,
  LogicalOperator,
} from "../../frontend/ast";
import Environment from "../environment";
import { evaluate } from "../interpreter";
import {
  type NumberVal,
  type RuntimeVal,
  MK_NULL,
  type ObjectVal,
  type StringVal,
  type NativeFnVal,
  type FunctionVal,
  type BooleanVal,
  type ComparableVal,
} from "../values";

function evaluateLogicalBinaryExpr(
  lhs: ComparableVal,
  rhs: ComparableVal,
  operator: LogicalOperator
): ComparableVal {
  let result;

  switch (operator) {
    case "&&":
      result = lhs.value ? rhs : lhs;
      break;
    case "||":
      result = lhs.value ? lhs : rhs;
      break;
  }

  return result;
}

function evaluateComparisonBinaryExpr(
  lhs: ComparableVal,
  rhs: ComparableVal,
  operator: ComparisonOperator
): BooleanVal {
  let result: boolean;
  if (lhs.type === "null" || rhs.type === "null") {
    if (operator === "==") result = lhs.value === rhs.value;
    else if (operator === "!=") result = lhs.value !== rhs.value;
    else throw `Cannot compare a value with null, use == or != only`;
  } else {
    switch (operator) {
      case "<":
        result = lhs.value < rhs.value;
        break;

      case ">":
        result = lhs.value > rhs.value;
        break;

      case "<=":
        result = lhs.value <= rhs.value;
        break;

      case ">=":
        result = lhs.value >= rhs.value;
        break;

      case "==":
        result = lhs.value === rhs.value;
        break;

      case "!=":
        result = lhs.value !== rhs.value;
        break;
    }
  }

  return { type: "boolean", value: result };
}

function evaluateNumericBinaryExpr(
  lhs: NumberVal,
  rhs: NumberVal,
  operator: ArithmeticOperator
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
      if (rhs.value === 0) throw "DivisionByZeroError: rhs value is zero";

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

  if (
    leftHandSide.type === "number" &&
    rightHandSide.type === "number" &&
    isArithmeticOperator(binOp.operator)
  ) {
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
  } else if (
    isComparable(leftHandSide) &&
    isComparable(rightHandSide) &&
    isComparisonOperator(binOp.operator)
  ) {
    return evaluateComparisonBinaryExpr(
      leftHandSide,
      rightHandSide,
      binOp.operator
    );
  } else if (
    isComparable(leftHandSide) &&
    isComparable(rightHandSide) &&
    isLogicalOperator(binOp.operator)
  ) {
    return evaluateLogicalBinaryExpr(
      leftHandSide,
      rightHandSide,
      binOp.operator
    );
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

  if (fn.type === "nativeFn") {
    return (fn as NativeFnVal).call(args, env);
  }

  if (fn.type === "function") {
    const func = fn as FunctionVal;
    const scope = new Environment(func.declarationEnv);

    // Create the variables for the parameter list
    if (func.parameters.length !== args.length) {
      throw `The function needs ${func.parameters.length} arguments, but you only passed ${args.length}`;
    }
    for (let i = 0; i < func.parameters.length; i++) {
      scope.declareVar(func.parameters[i], args[i], false);
    }

    let result: RuntimeVal = MK_NULL();

    // Evaluate the function body line by line
    for (const stmt of func.body) {
      result = evaluate(stmt, scope);
    }

    return result;
  }

  throw "Cannot call a value that is not a function: " + JSON.stringify(fn);
}

function isArithmeticOperator(op: string): op is ArithmeticOperator {
  return ["+", "-", "*", "/", "%"].includes(op);
}

function isComparisonOperator(op: string): op is ComparisonOperator {
  return [">", "<", ">=", "<=", "==", "!="].includes(op);
}

function isLogicalOperator(op: string): op is LogicalOperator {
  return ["&&", "||"].includes(op);
}

function isComparable(val: RuntimeVal): val is ComparableVal {
  return ["number", "null", "string", "boolean"].includes(val.type);
}
