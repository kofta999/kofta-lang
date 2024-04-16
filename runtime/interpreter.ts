import { type NumberVal, type RuntimeVal } from "./values";
import type {
  BinaryExpr,
  NumericLiteral,
  Program,
  Statement,
  Identifier,
  VarDeclaration,
  AssignmentExpr,
} from "../frontend/ast";
import Environment from "./environment";
import {
  evaluateIdentifier,
  evaluateBinaryExpr,
  evaluateAssignment,
} from "./eval/expressions";
import { evaluateProgram, evaluateVarDeclaration } from "./eval/statements";

export function evaluate(astNode: Statement, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    // Handle Expressions
    case "NumericLiteral":
      return {
        value: (astNode as NumericLiteral).value,
        type: "number",
      } as NumberVal;

    case "Identifier":
      return evaluateIdentifier(astNode as Identifier, env);

    case "BinaryExpr":
      return evaluateBinaryExpr(astNode as BinaryExpr, env);

    case "AssignmentExpr":
      return evaluateAssignment(astNode as AssignmentExpr, env);

    // Handle Statements
    case "Program":
      return evaluateProgram(astNode as Program, env);

    case "VarDeclaration":
      return evaluateVarDeclaration(astNode as VarDeclaration, env);

    default:
      console.error(
        "This AST Node has not yet been set up for interpretation.",
        astNode
      );
      process.exit(1);
  }
}
