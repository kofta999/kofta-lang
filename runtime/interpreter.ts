import { type RuntimeVal, type NumberVal, MK_NULL } from "./values";
import type {
  BinaryExpr,
  NodeType,
  NumericLiteral,
  Program,
  Statement,
  Identifier,
} from "../frontend/ast";
import Environment from "./environment";

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

function evaluateProgram(program: Program, env: Environment): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL();

  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
  }

  return lastEvaluated;
}

function evaluateBinaryExpr(binOp: BinaryExpr, env: Environment): RuntimeVal {
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

function evaluateIdentifier(ident: Identifier, env: Environment) {
  return env.lookupVar(ident.symbol);
}

export function evaluate(astNode: Statement, env: Environment) {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: (astNode as NumericLiteral).value,
        type: "number",
      } as NumberVal;

    case "Identifier":
      return evaluateIdentifier(astNode as Identifier, env);

    case "BinaryExpr":
      return evaluateBinaryExpr(astNode as BinaryExpr, env);

    case "Program":
      return evaluateProgram(astNode as Program, env);

    default:
      console.error(
        "This AST Node has not yet been set up for interpretation.",
        astNode
      );
      process.exit(1);
  }
}
