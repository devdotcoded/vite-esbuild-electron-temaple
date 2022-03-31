import readline from "readline";

export function prompt(question: string): [() => Promise<boolean>, () => void] {
  const input = process.stdin;
  const output = process.stdout;

  const readlineInstance = readline.createInterface({
    input,
    output,
  });

  let answerResolve: (answer: boolean) => void = () => {};

  const answerPromise = new Promise<boolean>((resolve) => {
    answerResolve = resolve;
  });

  readlineInstance.question(`${question} (Y/n)`, (answer) => {
    answerResolve(answer === "Y" || answer == "y");
    readlineInstance.close();
  });

  return [
    () => answerPromise,
    () => {
      readlineInstance.close();
    },
  ];
}
