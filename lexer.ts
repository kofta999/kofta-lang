// let x = 45 + (foo * bar)

export enum TokenType {
  Let,
  Identifier,
  Number,
  Equals,
  OpenParen,
  CloseParen,
  BinaryOperator,
}

const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.Let,
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
      case "(": {
        tokens.push(createToken(src.shift()!, TokenType.OpenParen));
        break;
      }

      case ")": {
        tokens.push(createToken(src.shift()!, TokenType.CloseParen));
        break;
      }

      case "+":
      case "-":
      case "*":
      case "/": {
        tokens.push(createToken(src.shift()!, TokenType.OpenParen));
        break;
      }

      case "=": {
        tokens.push(createToken(src.shift()!, TokenType.Equals));
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
              Object.hasOwn(KEYWORDS, identifier)
                ? KEYWORDS[identifier]
                : TokenType.Identifier
            )
          );
        } else if (isSkippable(src[0])) {
          src.shift();
        } else {
          console.log("Unrecognized character found in source:", src.shift()!);
          process.exit(1);
        }
      }
    }
  }

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
  return value === " " || value === "\n" || value === "\t";
}

const sourceCode = await Bun.file("./test.kft").text();
console.log(sourceCode);

for (const token of tokenize(sourceCode)) {
  console.log(token);
}
