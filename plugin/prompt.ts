import chalk from "chalk";
import readline from "readline";

export function prompt(question: string): [() => Promise<boolean>, () => void] {
  const input = process.stdin;
  const output = process.stdout;

  const rl = readline.createInterface({
    input,
    output,
  });

  let answerResolve: (answer: boolean) => void = () => {};
  const answerPromise = new Promise<boolean>((r) => {
    answerResolve = r;
  });

  rl.question(`${chalk.green("?")} ${question} (Y/n)`, (answer) => {
    answerResolve(answer === "Y" || answer == "y");
    rl.close();
  });

  return [
    () => answerPromise,
    () => {
      console.log("");
      rl.close();
    },
  ];
}
