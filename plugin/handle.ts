import chalk from "chalk";
import { ChildProcess, spawn } from "child_process";
import electron from "electron";
import { build } from "esbuild";
import { join } from "path";
import { createEsbuildOptions } from "./esbuild.options";
import { prompt } from "./prompt";
import { ResolvedViteElectronBuilderOptions } from "./types";

function runMainProcess(mainFile: string) {
  return spawn(electron as any, [mainFile], { stdio: "inherit" });
}

export function handleDev(options: ResolvedViteElectronBuilderOptions) {
  const { outdir } = options;
  const mainFile = join(outdir, "index.js");
  const esbuildOptions = createEsbuildOptions(options);

  let stopPromptToRunElectron: () => void = () => {};

  let child: ChildProcess;
  build({
    ...esbuildOptions,
    watch: {
      onRebuild: async (error) => {
        stopPromptToRunElectron();

        if (error) {
          console.error(chalk.red("Rebuild Failed:"), error);
          return;
        }

        const [readAnswer, stop] = prompt(
          "Rebuild Succeeded. Need rerun Electron?"
        );
        stopPromptToRunElectron = stop;

        if (await readAnswer()) {
          if (child) child.kill();
          child = runMainProcess(mainFile);
        }

        if (child) child.kill();
        child = runMainProcess(mainFile);
      },
    },
  }).then(() => {
    console.log(chalk.yellowBright("⚡Main Process Running"));
    if (child) child.kill();
    child = runMainProcess(mainFile);
  });
}

export function handleBuild(options: ResolvedViteElectronBuilderOptions) {
  const esbuildOptions = createEsbuildOptions(options);

  build(esbuildOptions)
    .then(async () => {
      await options.afterEsbuildBuild();

      console.log(chalk.green("Main Process Build Succeeded."));
    })
    .catch((error) => {
      console.log(`\n${chalk.red("Main Process Build Failed")}\n`, error, "\n");
    });
}
