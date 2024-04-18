import { type NumberVal, type RuntimeVal, type StringVal } from "./values";
import type {
  BinaryExpr,
  NumericLiteral,
  Program,
  Statement,
  Identifier,
  VarDeclaration,
  AssignmentExpr,
  ObjectLiteral,
  StringLiteral,
  CallExpr,
  FunctionDeclaration,
} from "../frontend/ast";
import Environment from "./environment";
import {
  evaluateIdentifier,
  evaluateBinaryExpr,
  evaluateAssignment,
  evaluateObjectExpr,
  evaluateCallExpr,
} from "./eval/expressions";
import {
  evaluateFunctionDeclaration,
  evaluateProgram,
  evaluateVarDeclaration,
} from "./eval/statements";

export function evaluate(astNode: Statement, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    // Handle Expressions
    case "NumericLiteral":
      return {
        value: (astNode as NumericLiteral).value,
        type: "number",
      } as NumberVal;

    case "StringLiteral":
      return {
        value: (astNode as StringLiteral).value,
        type: "string",
      } as StringVal;

    case "Identifier":
      return evaluateIdentifier(astNode as Identifier, env);

    case "BinaryExpr":
      return evaluateBinaryExpr(astNode as BinaryExpr, env);

    case "AssignmentExpr":
      return evaluateAssignment(astNode as AssignmentExpr, env);

    case "ObjectLiteral":
      return evaluateObjectExpr(astNode as ObjectLiteral, env);

    case "CallExpr":
      return evaluateCallExpr(astNode as CallExpr, env);

    // Handle Statements
    case "Program":
      return evaluateProgram(astNode as Program, env);

    case "VarDeclaration":
      return evaluateVarDeclaration(astNode as VarDeclaration, env);

    case "FunctionDeclaration":
      return evaluateFunctionDeclaration(astNode as FunctionDeclaration, env);

    default:
      console.error(
        "This AST Node has not yet been set up for interpretation.",
        astNode
      );
      process.exit(1);
  }
}
