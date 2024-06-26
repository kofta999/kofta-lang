import type { BarBarEqualsToken } from "typescript";

export enum TokenType {
  // Keywords
  Let,
  Const,
  Func,

  // Literal Types
  Identifier,
  Number,
  String,

  // Grouping Operators
  Equals,
  SemiColon,
  OpenParen,
  CloseParen,
  Colon,
  Comma,
  Dot,
  OpenBrace,
  CloseBrace,
  OpenBracket,
  CloseBracket,
  DoubleQuote,

  // Arithmetic Operators
  PlusToken,
  MinusToken,
  AsteriskToken,
  SlashToken,
  PercentToken,

  // Comparison Operators
  LessThan,
  GreaterThan,
  LessThanOrEqual,
  GreaterThanOrEqual,
  EqualEqual,
  NotEqual,

  // Logical Operators
  ExclamationToken,
  AmpersandAmpersandToken,
  BarBarToken,

  // End of File
  EOF,
}

const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.Let,
  const: TokenType.Const,
  func: TokenType.Func,
};

export interface Token {
  value: string;
  type: TokenType;
}

export function tokenize(sourceCode: string): Token[] {
  const tokens: Token[] = [];
  const src = sourceCode.split("");

  while (src.length > 0) {
    switch (src[0]) {
      case `"`: {
        src.shift();
        let string = "";

        while (src.length > 0 && src[0] !== `"`) {
          string += src.shift();
        }

        if (src[0] === `"`) {
          tokens.push(createToken(string, TokenType.String));
        }

        src.shift();

        break;
      }

      case "(": {
        tokens.push(createToken(src.shift()!, TokenType.OpenParen));
        break;
      }

      case ")": {
        tokens.push(createToken(src.shift()!, TokenType.CloseParen));
        break;
      }

      case "{": {
        tokens.push(createToken(src.shift()!, TokenType.OpenBrace));
        break;
      }

      case "}": {
        tokens.push(createToken(src.shift()!, TokenType.CloseBrace));
        break;
      }

      case "[": {
        tokens.push(createToken(src.shift()!, TokenType.OpenBracket));
        break;
      }

      case "]": {
        tokens.push(createToken(src.shift()!, TokenType.CloseBracket));
        break;
      }

      case ":": {
        tokens.push(createToken(src.shift()!, TokenType.Colon));
        break;
      }

      case ",": {
        tokens.push(createToken(src.shift()!, TokenType.Comma));
        break;
      }

      case ".": {
        tokens.push(createToken(src.shift()!, TokenType.Dot));
        break;
      }

      case "+": {
        tokens.push(createToken(src.shift()!, TokenType.PlusToken));
        break;
      }

      case "-": {
        tokens.push(createToken(src.shift()!, TokenType.MinusToken));
        break;
      }

      case "*": {
        tokens.push(createToken(src.shift()!, TokenType.AsteriskToken));
        break;
      }

      case "/": {
        tokens.push(createToken(src.shift()!, TokenType.SlashToken));
        break;
      }

      case "%": {
        tokens.push(createToken(src.shift()!, TokenType.PercentToken));
        break;
      }

      case "<": {
        let token = src.shift()!;
        if ((src[0] as string) === "=") {
          token += src.shift()!;
          tokens.push(createToken(token, TokenType.LessThanOrEqual));
        } else {
          tokens.push(createToken(token, TokenType.LessThan));
        }

        break;
      }

      case ">": {
        let token = src.shift()!;

        if ((src[0] as string) === "=") {
          token += src.shift()!;

          tokens.push(createToken(token, TokenType.GreaterThanOrEqual));
        } else {
          tokens.push(createToken(token, TokenType.GreaterThan));
        }
        break;
      }

      case "=": {
        let token = src.shift()!;

        if (src[0] === "=") {
          token += src.shift()!;
          tokens.push(createToken(token, TokenType.EqualEqual));
        } else {
          tokens.push(createToken(token, TokenType.Equals));
        }

        break;
      }

      case "!": {
        let token = src.shift()!;

        if ((src[0] as string) === "=") {
          token += src.shift()!;

          tokens.push(createToken(token, TokenType.NotEqual));
        } else {
          tokens.push(createToken(token, TokenType.ExclamationToken));
        }

        break;
      }

      case "&": {
        let token = src.shift()!;

        if ((src[0] as string) === "&") {
          token += src.shift()!;

          tokens.push(createToken(token, TokenType.AmpersandAmpersandToken));
        }

        break;
      }

      case "|": {
        let token = src.shift()!;

        if ((src[0] as string) === "|") {
          token += src.shift()!;

          tokens.push(createToken(token, TokenType.BarBarToken));
        }

        break;
      }

      case ";": {
        tokens.push(createToken(src.shift()!, TokenType.SemiColon));
        break;
      }

      // handle multi character token
      default: {
        // build number token
        if (isInt(src[0])) {
          let num = "";

          while (src.length > 0 && isInt(src[0])) {
            num += src.shift();
          }

          tokens.push(createToken(num, TokenType.Number));
        } else if (isAlpha(src[0])) {
          let identifier = "";

          while (src.length > 0 && isAlpha(src[0])) {
            identifier += src.shift();
          }

          // check for reserved keywords
          tokens.push(
            createToken(
              identifier,
              typeof KEYWORDS[identifier] === "number"
                ? KEYWORDS[identifier]
                : TokenType.Identifier
            )
          );
        } else if (isSkippable(src[0])) {
          src.shift();
        } else {
          console.error(
            "LexerError: Unrecognized character found in source, ",
            src.shift()!
          );
          process.exit(1);
        }
      }
    }
  }

  tokens.push({ type: TokenType.EOF, value: "EndOfFile" });

  return tokens;
}

function createToken(value: string, type: TokenType): Token {
  return { value, type };
}

function isAlpha(value: string): boolean {
  return value.toUpperCase() !== value.toLowerCase();
}

function isInt(value: string): boolean {
  const c = value.charCodeAt(0);
  const bounds = ["0".charCodeAt(0), "9".charCodeAt(0)];

  return c >= bounds[0] && c <= bounds[1];
}

function isSkippable(value: string): boolean {
  return value === " " || value === "\n" || value === "\t" || value === "\r";
}
