import type {
  Statement,
  Program,
  BinaryExpr,
  NumericLiteral,
  Identifier,
  Expr,
  VarDeclaration,
  AssignmentExpr,
  Property,
  ObjectLiteral,
} from "./ast";

import { tokenize, type Token, TokenType } from "./lexer";

export default class Parser {
  private tokens: Token[] = [];

  private isEOF(): boolean {
    return this.at().type === TokenType.EOF;
  }

  private at(): Token {
    return this.tokens[0];
  }

  private eat(): Token {
    return this.tokens.shift()!;
  }

  private expect(type: TokenType, err: any): Token {
    const prev = this.eat();

    if (!prev || prev.type != type) {
      console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
      process.exit(1);
    }

    return prev;
  }

  private parseStatement(): Statement {
    switch (this.at().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parseVarDeclaration();

      default:
        return this.parseExpr();
    }
  }

  private parseVarDeclaration(): Statement {
    const isConstant = this.eat().type === TokenType.Const;
    const identifier = this.expect(
      TokenType.Identifier,
      `Expected identifier name following ${
        isConstant ? "const" : "let"
      } keyword.`
    ).value;

    if (this.at().type === TokenType.SemiColon) {
      this.eat(); // expect semicolon
      if (isConstant)
        throw "Must assign value to constant expression. No value provided";

      return {
        kind: "VarDeclaration",
        constant: false,
        identifier,
        value: undefined,
      } as VarDeclaration;
    }

    this.expect(
      TokenType.Equals,
      "Expected equals token following identifier in variable declaration."
    );

    const declaration: VarDeclaration = {
      kind: "VarDeclaration",
      value: this.parseExpr(),
      constant: isConstant,
      identifier,
    };

    // TODO: Make this optional later
    this.expect(
      TokenType.SemiColon,
      "Variable declaration must end with a semi colon"
    );

    return declaration;
  }

  private parseExpr(): Expr {
    return this.parseAssignmentExpr();
  }

  private parseObjectExpr(): Expr {
    if (this.at().type !== TokenType.OpenBrace) {
      return this.parseAdditiveExpr();
    }

    this.eat();

    const properties: Property[] = [];

    while (!this.isEOF() && this.at().type !== TokenType.CloseBrace) {
      const key = this.expect(
        TokenType.Identifier,
        "Object literal key expected"
      ).value;

      // Allows shorthand key: pair -> { key, } | { key }
      if (this.at().type === TokenType.Comma) {
        this.eat();
        properties.push({ key, kind: "Property" });

        continue;
      } else if (this.at().type === TokenType.CloseBrace) {
        properties.push({ key, kind: "Property" });
        continue;
      }

      // { key: value }
      this.expect(
        TokenType.Colon,
        "Missing colon following identifier in object literal"
      );
      const value = this.parseExpr();

      properties.push({ key, kind: "Property", value });

      if (this.at().type !== TokenType.CloseBrace) {
        this.expect(
          TokenType.Comma,
          "Expected comma or closing brace following property"
        );
      }
    }

    this.expect(TokenType.CloseBrace, "Object literal missing closing brace");

    return { kind: "ObjectLiteral", properties } as ObjectLiteral;
  }

  private parseAssignmentExpr(): Expr {
    const left = this.parseObjectExpr();

    if (this.at().type === TokenType.Equals) {
      this.eat();
      const value = this.parseAssignmentExpr();

      return {
        assignee: left,
        kind: "AssignmentExpr",
        value,
      } as AssignmentExpr;
    }

    return left;
  }

  private parseAdditiveExpr(): Expr {
    let left = this.parseMultiplicativeExpr();

    while (this.at().value === "+" || this.at().value === "-") {
      const operator = this.eat().value;
      const right = this.parseMultiplicativeExpr();

      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  private parseMultiplicativeExpr(): Expr {
    let left = this.parsePrimaryExpr();

    while (
      this.at().value === "*" ||
      this.at().value === "/" ||
      this.at().value === "%"
    ) {
      const operator = this.eat().value;
      const right = this.parsePrimaryExpr();

      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  private parsePrimaryExpr(): Expr {
    const tk = this.at().type;

    switch (tk) {
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;

      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value),
        } as NumericLiteral;

      case TokenType.OpenParen: {
        this.eat();
        const value = this.parseExpr();
        this.expect(
          TokenType.CloseParen,
          "Unexpected token found inside parenthesized expression, Expected closing parenthesis."
        );

        return value;
      }

      default:
        console.error("Unexpected token found during parsing", this.at());
        process.exit(1);
    }
  }

  public produceAST(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);

    const program: Program = {
      kind: "Program",
      body: [],
    };

    while (!this.isEOF()) {
      program.body.push(this.parseStatement());
    }

    return program;
  }
}
