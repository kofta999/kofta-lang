export type NodeType =
  // Statements
  | "Program"
  | "VarDeclaration"

  // Expressions
  | "NumericLiteral"
  | "Identifier"
  | "BinaryExpr";

// Statements

export interface Statement {
  kind: NodeType;
}

export interface Program extends Statement {
  kind: "Program";
  body: Statement[];
}

export interface VarDeclaration extends Statement {
  kind: "VarDeclaration";
  constant: boolean;
  identifier: string;
  value?: Expr;
}

// Expressions

export interface Expr extends Statement {}

export interface BinaryExpr extends Expr {
  kind: "BinaryExpr";
  left: Expr;
  right: Expr;
  operator: string;
}

export interface Identifier extends Expr {
  kind: "Identifier";
  symbol: string;
}

export interface NumericLiteral extends Expr {
  kind: "NumericLiteral";
  value: number;
}
