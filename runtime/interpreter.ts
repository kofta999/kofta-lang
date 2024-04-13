import type { RuntimeVal, NumberVal, NullVal } from "./values";
import type {
  BinaryExpr,
  NodeType,
  NumericLiteral,
  Program,
  Statement,
} from "../frontend/ast";

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

function evaluateProgram(program: Program): RuntimeVal {
  let lastEvaluated: RuntimeVal = { type: "null", value: "null" } as NullVal;

  for (const statement of program.body) {
    lastEvaluated = evaluate(statement);
  }

  return lastEvaluated;
}

function evaluateBinaryExpr(binOp: BinaryExpr): RuntimeVal {
  const leftHandSide = evaluate(binOp.left);
  const rightHandSide = evaluate(binOp.right);

  if (leftHandSide.type === "number" && rightHandSide.type === "number") {
    return evaluateNumericBinaryExpr(
      leftHandSide as NumberVal,
      rightHandSide as NumberVal,
      binOp.operator
    );
  }

  return { type: "null", value: "null" } as NullVal;
}

export function evaluate(astNode: Statement) {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: (astNode as NumericLiteral).value,
        type: "number",
      } as NumberVal;

    case "NullLiteral":
      return { value: "null", type: "null" } as NullVal;

    case "BinaryExpr":
      return evaluateBinaryExpr(astNode as BinaryExpr);

    case "Program":
      return evaluateProgram(astNode as Program);

    default:
      console.error(
        "This AST Node has not yet been set up for interpretation.",
        astNode
      );
      process.exit(1);
  }
}
