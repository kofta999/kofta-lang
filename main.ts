import { inspect } from "bun";
import Parser from "./frontend/parser";
import { evaluate } from "./runtime/interpreter";
import Environment from "./runtime/environment";
import { MK_NUMBER, MK_BOOL, MK_NULL } from "./runtime/values";

repl();

async function repl() {
  const parser = new Parser();
  const env = new Environment();
  env.declareVar("x", MK_NUMBER(100));
  env.declareVar("true", MK_BOOL(true));
  env.declareVar("false", MK_BOOL(false));
  env.declareVar("null", MK_NULL());

  console.write("KoftaLang repl v0.1\n> ");

  for await (const line of console) {
    if (line.includes("exit")) {
      process.exit(1);
    }

    const program = parser.produceAST(line);
    // console.log(inspect(program, { colors: true }));

    const result = evaluate(program, env);

    console.log(result);
    console.write("\n> ");
  }
}
