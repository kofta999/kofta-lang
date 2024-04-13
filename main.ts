import { inspect } from "bun";
import Parser from "./frontend/parser";
import { evaluate } from "./runtime/interpreter";

repl();

async function repl() {
  const parser = new Parser();
  console.write("KoftaLang repl v0.1\n> ");

  for await (const line of console) {
    if (line.includes("exit")) {
      process.exit(1);
    }

    const program = parser.produceAST(line);
    // console.log(inspect(program, { colors: true }));
    console.write("\n> ");

    const result = evaluate(program);

    console.log(result);
  }
}
