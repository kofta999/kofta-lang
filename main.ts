import { inspect } from "bun";
import Parser from "./frontend/parser";
import { evaluate } from "./runtime/interpreter";
import Environment from "./runtime/environment";

// repl();

run();

async function run() {
  const parser = new Parser();
  const env = new Environment();

  const file = Bun.file("main.kft");

  const program = parser.produceAST(await file.text());

  const result = evaluate(program, env);
}

async function repl() {
  const parser = new Parser();
  const env = new Environment();

  console.write("KoftaLang repl v0.1\n> ");

  for await (const line of console) {
    if (line.includes("exit")) {
      process.exit(1);
    }

    const program = parser.produceAST(line);
    // console.log(inspect(program, { colors: true }));

    const result = evaluate(program, env);

    // console.log(result);
    console.write("\n> ");
  }
}
