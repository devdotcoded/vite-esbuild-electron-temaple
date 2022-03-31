// vite.config.ts
import reactRefresh from "@vitejs/plugin-react-refresh";
import { compileFile } from "bytenode";
import { writeFileSync } from "fs";
import { join as join3 } from "path";
import { defineConfig } from "vite";

// plugin/handle.ts
import chalk2 from "chalk";
import { spawn } from "child_process";
import electron from "electron";
import { build } from "esbuild";
import { join } from "path";

// plugin/esbuild.options.ts
import { esbuildDecorators } from "@anatine/esbuild-decorators";
function createEsbuildOptions(options) {
  const define = Object.entries(options.env).reduce((preVal, [key, value]) => ({
    ...preVal,
    [`process.env.${key}`]: JSON.stringify(value)
  }), {});
  const { entryFile, outdir, tsconfig, external, preloadFile } = options;
  return {
    entryPoints: [entryFile, preloadFile],
    target: "es2020",
    outdir,
    format: "cjs",
    bundle: true,
    platform: "node",
    define,
    tsconfig,
    plugins: [esbuildDecorators({ tsconfig })],
    external
  };
}

// plugin/prompt.ts
import chalk from "chalk";
import readline from "readline";
function prompt(question) {
  const input = process.stdin;
  const output = process.stdout;
  const rl = readline.createInterface({
    input,
    output
  });
  let answerResolve = () => {
  };
  const answerPromise = new Promise((r) => {
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
    }
  ];
}

// plugin/handle.ts
function runMainProcess(mainFile) {
  return spawn(electron, [mainFile], { stdio: "inherit" });
}
function handleDev(options) {
  const { outdir } = options;
  const mainFile = join(outdir, "index.js");
  const esbuildOptions = createEsbuildOptions(options);
  let stopPromptToRunElectron = () => {
  };
  let child;
  build({
    ...esbuildOptions,
    watch: {
      onRebuild: async (error) => {
        stopPromptToRunElectron();
        if (error) {
          console.error(chalk2.red("Rebuild Failed:"), error);
          return;
        }
        const [readAnswer, stop] = prompt("Rebuild Succeeded. Need rerun Electron?");
        stopPromptToRunElectron = stop;
        if (await readAnswer()) {
          if (child)
            child.kill();
          child = runMainProcess(mainFile);
        }
        if (child)
          child.kill();
        child = runMainProcess(mainFile);
      }
    }
  }).then(() => {
    console.log(chalk2.yellowBright("\u26A1Main Process Running"));
    if (child)
      child.kill();
    child = runMainProcess(mainFile);
  });
}
function handleBuild(options) {
  const esbuildOptions = createEsbuildOptions(options);
  build(esbuildOptions).then(async () => {
    await options.afterEsbuildBuild();
    console.log(chalk2.green("Main Process Build Succeeded."));
  }).catch((error) => {
    console.log(`
${chalk2.red("Main Process Build Failed")}
`, error, "\n");
  });
}

// plugin/options.ts
import { builtinModules } from "module";
import { join as join2 } from "path";
function resolveOptions(options, viteConfig) {
  const root = options.root || process.cwd();
  const external = Array.from(/* @__PURE__ */ new Set([
    ...builtinModules.filter((x) => !/^_|^(internal|v8|node-inspect)\/|\//.test(x)),
    "electron",
    ...Array.isArray(options.external) ? options.external : []
  ]));
  const {
    outdir = join2(root, "app/main"),
    entryFile = join2(root, "src/main/index.ts"),
    preloadFile = join2(root, "src/main/preload.ts"),
    tsconfig,
    afterEsbuildBuild = async () => {
    }
  } = options;
  const { env, command } = viteConfig;
  const resolvedViteElectronBuilderOptions = {
    root,
    outdir,
    entryFile,
    preloadFile,
    tsconfig,
    env,
    command,
    external,
    afterEsbuildBuild
  };
  return resolvedViteElectronBuilderOptions;
}

// plugin/index.ts
function VitePluginElectronBuilder(userOptions = {}) {
  let viteConfig;
  let options;
  return {
    name: "vite-plugin-electron-builder",
    configResolved(config) {
      viteConfig = config;
      options = resolveOptions(userOptions, viteConfig);
    },
    configureServer: ({ httpServer }) => {
      httpServer.on("listening", () => {
        const address = httpServer.address();
        options.env.DEV_SERVER_URL = `http://${address.address}:${address.port}`;
        handleDev(options);
      });
    },
    closeBundle: () => {
      handleBuild(options);
    }
  };
}

// vite.config.ts
var vite_config_default = defineConfig({
  root: join3("/Users/marc/Documents/Code/dotcoded/stupendastic/CamerasHealthCheckerV2", "src/render"),
  plugins: [
    reactRefresh(),
    VitePluginElectronBuilder({
      root: process.cwd(),
      tsconfig: "./tsconfig.main.json",
      afterEsbuildBuild: async () => {
        await compileFile({
          filename: "./app/main/index.js",
          output: "./app/main/main.jsc",
          electron: true
        });
        await compileFile({
          filename: "./app/main/preload.js",
          output: "./app/main/preload.jsc",
          electron: true
        });
        writeFileSync("./app/main/index.js", "require('bytenode');require('./main.jsc')");
        writeFileSync("./app/main/preload.js", "require('bytenode');require('./preload.jsc')");
      }
    })
  ],
  resolve: {
    alias: {
      "@render": join3("/Users/marc/Documents/Code/dotcoded/stupendastic/CamerasHealthCheckerV2", "src/render"),
      "@main": join3("/Users/marc/Documents/Code/dotcoded/stupendastic/CamerasHealthCheckerV2", "src/main"),
      "@common": join3("/Users/marc/Documents/Code/dotcoded/stupendastic/CamerasHealthCheckerV2", "src/common")
    }
  },
  base: "./",
  build: {
    outDir: join3("/Users/marc/Documents/Code/dotcoded/stupendastic/CamerasHealthCheckerV2", "app/render"),
    emptyOutDir: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGx1Z2luL2hhbmRsZS50cyIsICJwbHVnaW4vZXNidWlsZC5vcHRpb25zLnRzIiwgInBsdWdpbi9wcm9tcHQudHMiLCAicGx1Z2luL29wdGlvbnMudHMiLCAicGx1Z2luL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgcmVhY3RSZWZyZXNoIGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1yZWZyZXNoXCI7XG5pbXBvcnQgeyBjb21waWxlRmlsZSB9IGZyb20gXCJieXRlbm9kZVwiO1xuaW1wb3J0IHsgd3JpdGVGaWxlU3luYyB9IGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgVml0ZVBsdWdpbkVsZWN0cm9uQnVpbGRlciB9IGZyb20gXCIuL3BsdWdpblwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICByb290OiBqb2luKFwiL1VzZXJzL21hcmMvRG9jdW1lbnRzL0NvZGUvZG90Y29kZWQvc3R1cGVuZGFzdGljL0NhbWVyYXNIZWFsdGhDaGVja2VyVjJcIiwgXCJzcmMvcmVuZGVyXCIpLFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3RSZWZyZXNoKCksXG4gICAgVml0ZVBsdWdpbkVsZWN0cm9uQnVpbGRlcih7XG4gICAgICByb290OiBwcm9jZXNzLmN3ZCgpLFxuICAgICAgdHNjb25maWc6IFwiLi90c2NvbmZpZy5tYWluLmpzb25cIixcbiAgICAgIGFmdGVyRXNidWlsZEJ1aWxkOiBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGNvbXBpbGVGaWxlKHtcbiAgICAgICAgICBmaWxlbmFtZTogXCIuL2FwcC9tYWluL2luZGV4LmpzXCIsXG4gICAgICAgICAgb3V0cHV0OiBcIi4vYXBwL21haW4vbWFpbi5qc2NcIixcbiAgICAgICAgICBlbGVjdHJvbjogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IGNvbXBpbGVGaWxlKHtcbiAgICAgICAgICBmaWxlbmFtZTogXCIuL2FwcC9tYWluL3ByZWxvYWQuanNcIixcbiAgICAgICAgICBvdXRwdXQ6IFwiLi9hcHAvbWFpbi9wcmVsb2FkLmpzY1wiLFxuICAgICAgICAgIGVsZWN0cm9uOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgICAgd3JpdGVGaWxlU3luYyhcbiAgICAgICAgICBcIi4vYXBwL21haW4vaW5kZXguanNcIixcbiAgICAgICAgICBcInJlcXVpcmUoJ2J5dGVub2RlJyk7cmVxdWlyZSgnLi9tYWluLmpzYycpXCJcbiAgICAgICAgKTtcbiAgICAgICAgd3JpdGVGaWxlU3luYyhcbiAgICAgICAgICBcIi4vYXBwL21haW4vcHJlbG9hZC5qc1wiLFxuICAgICAgICAgIFwicmVxdWlyZSgnYnl0ZW5vZGUnKTtyZXF1aXJlKCcuL3ByZWxvYWQuanNjJylcIlxuICAgICAgICApO1xuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkByZW5kZXJcIjogam9pbihcIi9Vc2Vycy9tYXJjL0RvY3VtZW50cy9Db2RlL2RvdGNvZGVkL3N0dXBlbmRhc3RpYy9DYW1lcmFzSGVhbHRoQ2hlY2tlclYyXCIsIFwic3JjL3JlbmRlclwiKSxcbiAgICAgIFwiQG1haW5cIjogam9pbihcIi9Vc2Vycy9tYXJjL0RvY3VtZW50cy9Db2RlL2RvdGNvZGVkL3N0dXBlbmRhc3RpYy9DYW1lcmFzSGVhbHRoQ2hlY2tlclYyXCIsIFwic3JjL21haW5cIiksXG4gICAgICBcIkBjb21tb25cIjogam9pbihcIi9Vc2Vycy9tYXJjL0RvY3VtZW50cy9Db2RlL2RvdGNvZGVkL3N0dXBlbmRhc3RpYy9DYW1lcmFzSGVhbHRoQ2hlY2tlclYyXCIsIFwic3JjL2NvbW1vblwiKSxcbiAgICB9LFxuICB9LFxuICBiYXNlOiBcIi4vXCIsXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiBqb2luKFwiL1VzZXJzL21hcmMvRG9jdW1lbnRzL0NvZGUvZG90Y29kZWQvc3R1cGVuZGFzdGljL0NhbWVyYXNIZWFsdGhDaGVja2VyVjJcIiwgXCJhcHAvcmVuZGVyXCIpLFxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICB9LFxufSk7XG4iLCAiaW1wb3J0IGNoYWxrIGZyb20gXCJjaGFsa1wiO1xuaW1wb3J0IHsgQ2hpbGRQcm9jZXNzLCBzcGF3biB9IGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQgZWxlY3Ryb24gZnJvbSBcImVsZWN0cm9uXCI7XG5pbXBvcnQgeyBidWlsZCB9IGZyb20gXCJlc2J1aWxkXCI7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGNyZWF0ZUVzYnVpbGRPcHRpb25zIH0gZnJvbSBcIi4vZXNidWlsZC5vcHRpb25zXCI7XG5pbXBvcnQgeyBwcm9tcHQgfSBmcm9tIFwiLi9wcm9tcHRcIjtcbmltcG9ydCB7IFJlc29sdmVkVml0ZUVsZWN0cm9uQnVpbGRlck9wdGlvbnMgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG5mdW5jdGlvbiBydW5NYWluUHJvY2VzcyhtYWluRmlsZTogc3RyaW5nKSB7XG4gIHJldHVybiBzcGF3bihlbGVjdHJvbiBhcyBhbnksIFttYWluRmlsZV0sIHsgc3RkaW86IFwiaW5oZXJpdFwiIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlRGV2KG9wdGlvbnM6IFJlc29sdmVkVml0ZUVsZWN0cm9uQnVpbGRlck9wdGlvbnMpIHtcbiAgY29uc3QgeyBvdXRkaXIgfSA9IG9wdGlvbnM7XG4gIGNvbnN0IG1haW5GaWxlID0gam9pbihvdXRkaXIsIFwiaW5kZXguanNcIik7XG4gIGNvbnN0IGVzYnVpbGRPcHRpb25zID0gY3JlYXRlRXNidWlsZE9wdGlvbnMob3B0aW9ucyk7XG5cbiAgbGV0IHN0b3BQcm9tcHRUb1J1bkVsZWN0cm9uOiAoKSA9PiB2b2lkID0gKCkgPT4ge307XG5cbiAgbGV0IGNoaWxkOiBDaGlsZFByb2Nlc3M7XG4gIGJ1aWxkKHtcbiAgICAuLi5lc2J1aWxkT3B0aW9ucyxcbiAgICB3YXRjaDoge1xuICAgICAgb25SZWJ1aWxkOiBhc3luYyAoZXJyb3IpID0+IHtcbiAgICAgICAgc3RvcFByb21wdFRvUnVuRWxlY3Ryb24oKTtcblxuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZChcIlJlYnVpbGQgRmFpbGVkOlwiKSwgZXJyb3IpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IFtyZWFkQW5zd2VyLCBzdG9wXSA9IHByb21wdChcbiAgICAgICAgICBcIlJlYnVpbGQgU3VjY2VlZGVkLiBOZWVkIHJlcnVuIEVsZWN0cm9uP1wiXG4gICAgICAgICk7XG4gICAgICAgIHN0b3BQcm9tcHRUb1J1bkVsZWN0cm9uID0gc3RvcDtcblxuICAgICAgICBpZiAoYXdhaXQgcmVhZEFuc3dlcigpKSB7XG4gICAgICAgICAgaWYgKGNoaWxkKSBjaGlsZC5raWxsKCk7XG4gICAgICAgICAgY2hpbGQgPSBydW5NYWluUHJvY2VzcyhtYWluRmlsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hpbGQpIGNoaWxkLmtpbGwoKTtcbiAgICAgICAgY2hpbGQgPSBydW5NYWluUHJvY2VzcyhtYWluRmlsZSk7XG4gICAgICB9LFxuICAgIH0sXG4gIH0pLnRoZW4oKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKGNoYWxrLnllbGxvd0JyaWdodChcIlx1MjZBMU1haW4gUHJvY2VzcyBSdW5uaW5nXCIpKTtcbiAgICBpZiAoY2hpbGQpIGNoaWxkLmtpbGwoKTtcbiAgICBjaGlsZCA9IHJ1bk1haW5Qcm9jZXNzKG1haW5GaWxlKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVCdWlsZChvcHRpb25zOiBSZXNvbHZlZFZpdGVFbGVjdHJvbkJ1aWxkZXJPcHRpb25zKSB7XG4gIGNvbnN0IGVzYnVpbGRPcHRpb25zID0gY3JlYXRlRXNidWlsZE9wdGlvbnMob3B0aW9ucyk7XG5cbiAgYnVpbGQoZXNidWlsZE9wdGlvbnMpXG4gICAgLnRoZW4oYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgb3B0aW9ucy5hZnRlckVzYnVpbGRCdWlsZCgpO1xuXG4gICAgICBjb25zb2xlLmxvZyhjaGFsay5ncmVlbihcIk1haW4gUHJvY2VzcyBCdWlsZCBTdWNjZWVkZWQuXCIpKTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGBcXG4ke2NoYWxrLnJlZChcIk1haW4gUHJvY2VzcyBCdWlsZCBGYWlsZWRcIil9XFxuYCwgZXJyb3IsIFwiXFxuXCIpO1xuICAgIH0pO1xufVxuIiwgImltcG9ydCB7IGVzYnVpbGREZWNvcmF0b3JzIH0gZnJvbSBcIkBhbmF0aW5lL2VzYnVpbGQtZGVjb3JhdG9yc1wiO1xuaW1wb3J0IHsgQnVpbGRPcHRpb25zIH0gZnJvbSBcImVzYnVpbGRcIjtcbmltcG9ydCB7IFJlc29sdmVkVml0ZUVsZWN0cm9uQnVpbGRlck9wdGlvbnMgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXNidWlsZE9wdGlvbnMoXG4gIG9wdGlvbnM6IFJlc29sdmVkVml0ZUVsZWN0cm9uQnVpbGRlck9wdGlvbnNcbik6IEJ1aWxkT3B0aW9ucyB7XG4gIGNvbnN0IGRlZmluZSA9IE9iamVjdC5lbnRyaWVzKG9wdGlvbnMuZW52KS5yZWR1Y2UoXG4gICAgKHByZVZhbCwgW2tleSwgdmFsdWVdKSA9PiAoe1xuICAgICAgLi4ucHJlVmFsLFxuICAgICAgW2Bwcm9jZXNzLmVudi4ke2tleX1gXTogSlNPTi5zdHJpbmdpZnkodmFsdWUpLFxuICAgIH0pLFxuICAgIHt9XG4gICk7XG5cbiAgY29uc3QgeyBlbnRyeUZpbGUsIG91dGRpciwgdHNjb25maWcsIGV4dGVybmFsLCBwcmVsb2FkRmlsZSB9ID0gb3B0aW9ucztcbiAgcmV0dXJuIHtcbiAgICBlbnRyeVBvaW50czogW2VudHJ5RmlsZSwgcHJlbG9hZEZpbGVdLFxuICAgIHRhcmdldDogXCJlczIwMjBcIixcbiAgICBvdXRkaXIsXG4gICAgZm9ybWF0OiBcImNqc1wiLFxuICAgIGJ1bmRsZTogdHJ1ZSxcbiAgICBwbGF0Zm9ybTogXCJub2RlXCIsXG4gICAgZGVmaW5lLFxuICAgIHRzY29uZmlnLFxuICAgIHBsdWdpbnM6IFtlc2J1aWxkRGVjb3JhdG9ycyh7IHRzY29uZmlnIH0pXSxcbiAgICBleHRlcm5hbCxcbiAgfTtcbn1cbiIsICJpbXBvcnQgY2hhbGsgZnJvbSBcImNoYWxrXCI7XG5pbXBvcnQgcmVhZGxpbmUgZnJvbSBcInJlYWRsaW5lXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9tcHQocXVlc3Rpb246IHN0cmluZyk6IFsoKSA9PiBQcm9taXNlPGJvb2xlYW4+LCAoKSA9PiB2b2lkXSB7XG4gIGNvbnN0IGlucHV0ID0gcHJvY2Vzcy5zdGRpbjtcbiAgY29uc3Qgb3V0cHV0ID0gcHJvY2Vzcy5zdGRvdXQ7XG5cbiAgY29uc3QgcmwgPSByZWFkbGluZS5jcmVhdGVJbnRlcmZhY2Uoe1xuICAgIGlucHV0LFxuICAgIG91dHB1dCxcbiAgfSk7XG5cbiAgbGV0IGFuc3dlclJlc29sdmU6IChhbnN3ZXI6IGJvb2xlYW4pID0+IHZvaWQgPSAoKSA9PiB7fTtcbiAgY29uc3QgYW5zd2VyUHJvbWlzZSA9IG5ldyBQcm9taXNlPGJvb2xlYW4+KChyKSA9PiB7XG4gICAgYW5zd2VyUmVzb2x2ZSA9IHI7XG4gIH0pO1xuXG4gIHJsLnF1ZXN0aW9uKGAke2NoYWxrLmdyZWVuKFwiP1wiKX0gJHtxdWVzdGlvbn0gKFkvbilgLCAoYW5zd2VyKSA9PiB7XG4gICAgYW5zd2VyUmVzb2x2ZShhbnN3ZXIgPT09IFwiWVwiIHx8IGFuc3dlciA9PSBcInlcIik7XG4gICAgcmwuY2xvc2UoKTtcbiAgfSk7XG5cbiAgcmV0dXJuIFtcbiAgICAoKSA9PiBhbnN3ZXJQcm9taXNlLFxuICAgICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiXCIpO1xuICAgICAgcmwuY2xvc2UoKTtcbiAgICB9LFxuICBdO1xufVxuIiwgImltcG9ydCB7IGJ1aWx0aW5Nb2R1bGVzIH0gZnJvbSBcIm1vZHVsZVwiO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBSZXNvbHZlZENvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQge1xuICBSZXNvbHZlZFZpdGVFbGVjdHJvbkJ1aWxkZXJPcHRpb25zLFxuICBWaXRlRWxlY3Ryb25CdWlsZGVyT3B0aW9ucyxcbn0gZnJvbSBcIi4vdHlwZXNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVPcHRpb25zKFxuICBvcHRpb25zOiBQYXJ0aWFsPFZpdGVFbGVjdHJvbkJ1aWxkZXJPcHRpb25zPixcbiAgdml0ZUNvbmZpZzogUmVzb2x2ZWRDb25maWdcbikge1xuICBjb25zdCByb290ID0gb3B0aW9ucy5yb290IHx8IHByb2Nlc3MuY3dkKCk7XG4gIGNvbnN0IGV4dGVybmFsID0gQXJyYXkuZnJvbShcbiAgICBuZXcgU2V0KFtcbiAgICAgIC4uLmJ1aWx0aW5Nb2R1bGVzLmZpbHRlcihcbiAgICAgICAgKHgpID0+ICEvXl98XihpbnRlcm5hbHx2OHxub2RlLWluc3BlY3QpXFwvfFxcLy8udGVzdCh4KVxuICAgICAgKSxcbiAgICAgIFwiZWxlY3Ryb25cIixcbiAgICAgIC4uLihBcnJheS5pc0FycmF5KG9wdGlvbnMuZXh0ZXJuYWwpID8gb3B0aW9ucy5leHRlcm5hbCA6IFtdKSxcbiAgICBdKVxuICApO1xuXG4gIGNvbnN0IHtcbiAgICBvdXRkaXIgPSBqb2luKHJvb3QsIFwiYXBwL21haW5cIiksXG4gICAgZW50cnlGaWxlID0gam9pbihyb290LCBcInNyYy9tYWluL2luZGV4LnRzXCIpLFxuICAgIHByZWxvYWRGaWxlID0gam9pbihyb290LCBcInNyYy9tYWluL3ByZWxvYWQudHNcIiksXG4gICAgdHNjb25maWcsXG4gICAgYWZ0ZXJFc2J1aWxkQnVpbGQgPSBhc3luYyAoKSA9PiB7fSxcbiAgfSA9IG9wdGlvbnM7XG5cbiAgY29uc3QgeyBlbnYsIGNvbW1hbmQgfSA9IHZpdGVDb25maWc7XG5cbiAgY29uc3QgcmVzb2x2ZWRWaXRlRWxlY3Ryb25CdWlsZGVyT3B0aW9uczogUmVzb2x2ZWRWaXRlRWxlY3Ryb25CdWlsZGVyT3B0aW9ucyA9XG4gICAge1xuICAgICAgcm9vdCxcbiAgICAgIG91dGRpcixcbiAgICAgIGVudHJ5RmlsZSxcbiAgICAgIHByZWxvYWRGaWxlLFxuICAgICAgdHNjb25maWcsXG4gICAgICBlbnYsXG4gICAgICBjb21tYW5kLFxuICAgICAgZXh0ZXJuYWwsXG4gICAgICBhZnRlckVzYnVpbGRCdWlsZCxcbiAgICB9O1xuXG4gIHJldHVybiByZXNvbHZlZFZpdGVFbGVjdHJvbkJ1aWxkZXJPcHRpb25zO1xufVxuIiwgImltcG9ydCB0eXBlIHsgUGx1Z2luLCBSZXNvbHZlZENvbmZpZywgVml0ZURldlNlcnZlciB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgeyBoYW5kbGVCdWlsZCwgaGFuZGxlRGV2IH0gZnJvbSBcIi4vaGFuZGxlXCI7XG5pbXBvcnQgeyByZXNvbHZlT3B0aW9ucyB9IGZyb20gXCIuL29wdGlvbnNcIjtcbmltcG9ydCB7XG4gIFJlc29sdmVkVml0ZUVsZWN0cm9uQnVpbGRlck9wdGlvbnMsXG4gIFZpdGVFbGVjdHJvbkJ1aWxkZXJPcHRpb25zLFxufSBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gVml0ZVBsdWdpbkVsZWN0cm9uQnVpbGRlcihcbiAgdXNlck9wdGlvbnM6IFBhcnRpYWw8Vml0ZUVsZWN0cm9uQnVpbGRlck9wdGlvbnM+ID0ge31cbik6IFBsdWdpbiB7XG4gIGxldCB2aXRlQ29uZmlnOiBSZXNvbHZlZENvbmZpZztcbiAgbGV0IG9wdGlvbnM6IFJlc29sdmVkVml0ZUVsZWN0cm9uQnVpbGRlck9wdGlvbnM7XG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcInZpdGUtcGx1Z2luLWVsZWN0cm9uLWJ1aWxkZXJcIixcbiAgICBjb25maWdSZXNvbHZlZChjb25maWcpIHtcbiAgICAgIHZpdGVDb25maWcgPSBjb25maWc7XG4gICAgICBvcHRpb25zID0gcmVzb2x2ZU9wdGlvbnModXNlck9wdGlvbnMsIHZpdGVDb25maWcpO1xuICAgIH0sXG4gICAgY29uZmlndXJlU2VydmVyOiAoeyBodHRwU2VydmVyIH06IFZpdGVEZXZTZXJ2ZXIpID0+IHtcbiAgICAgIGh0dHBTZXJ2ZXIub24oXCJsaXN0ZW5pbmdcIiwgKCkgPT4ge1xuICAgICAgICBjb25zdCBhZGRyZXNzOiBhbnkgPSBodHRwU2VydmVyLmFkZHJlc3MoKTtcbiAgICAgICAgb3B0aW9ucy5lbnYuREVWX1NFUlZFUl9VUkwgPSBgaHR0cDovLyR7YWRkcmVzcy5hZGRyZXNzfToke2FkZHJlc3MucG9ydH1gO1xuXG4gICAgICAgIGhhbmRsZURldihvcHRpb25zKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgY2xvc2VCdW5kbGU6ICgpID0+IHtcbiAgICAgIGhhbmRsZUJ1aWxkKG9wdGlvbnMpO1xuICAgIH0sXG4gIH07XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDSkE7QUFJTyw4QkFDTCxTQUNjO0FBQ2QsUUFBTSxTQUFTLE9BQU8sUUFBUSxRQUFRLEdBQUcsRUFBRSxPQUN6QyxDQUFDLFFBQVEsQ0FBQyxLQUFLLFdBQVk7QUFBQSxPQUN0QjtBQUFBLEtBQ0YsZUFBZSxRQUFRLEtBQUssVUFBVSxLQUFLO0FBQUEsRUFDOUMsSUFDQSxDQUFDLENBQ0g7QUFFQSxRQUFNLEVBQUUsV0FBVyxRQUFRLFVBQVUsVUFBVSxnQkFBZ0I7QUFDL0QsU0FBTztBQUFBLElBQ0wsYUFBYSxDQUFDLFdBQVcsV0FBVztBQUFBLElBQ3BDLFFBQVE7QUFBQSxJQUNSO0FBQUEsSUFDQSxRQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsSUFDUixVQUFVO0FBQUEsSUFDVjtBQUFBLElBQ0E7QUFBQSxJQUNBLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUFBLElBQ3pDO0FBQUEsRUFDRjtBQUNGOzs7QUM1QkE7QUFDQTtBQUVPLGdCQUFnQixVQUF3RDtBQUM3RSxRQUFNLFFBQVEsUUFBUTtBQUN0QixRQUFNLFNBQVMsUUFBUTtBQUV2QixRQUFNLEtBQUssU0FBUyxnQkFBZ0I7QUFBQSxJQUNsQztBQUFBLElBQ0E7QUFBQSxFQUNGLENBQUM7QUFFRCxNQUFJLGdCQUEyQyxNQUFNO0FBQUEsRUFBQztBQUN0RCxRQUFNLGdCQUFnQixJQUFJLFFBQWlCLENBQUMsTUFBTTtBQUNoRCxvQkFBZ0I7QUFBQSxFQUNsQixDQUFDO0FBRUQsS0FBRyxTQUFTLEdBQUcsTUFBTSxNQUFNLEdBQUcsS0FBSyxrQkFBa0IsQ0FBQyxXQUFXO0FBQy9ELGtCQUFjLFdBQVcsT0FBTyxVQUFVLEdBQUc7QUFDN0MsT0FBRyxNQUFNO0FBQUEsRUFDWCxDQUFDO0FBRUQsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUNKLGNBQVEsSUFBSSxFQUFFO0FBQ2QsU0FBRyxNQUFNO0FBQUEsSUFDWDtBQUFBLEVBQ0Y7QUFDRjs7O0FGcEJBLHdCQUF3QixVQUFrQjtBQUN4QyxTQUFPLE1BQU0sVUFBaUIsQ0FBQyxRQUFRLEdBQUcsRUFBRSxPQUFPLFVBQVUsQ0FBQztBQUNoRTtBQUVPLG1CQUFtQixTQUE2QztBQUNyRSxRQUFNLEVBQUUsV0FBVztBQUNuQixRQUFNLFdBQVcsS0FBSyxRQUFRLFVBQVU7QUFDeEMsUUFBTSxpQkFBaUIscUJBQXFCLE9BQU87QUFFbkQsTUFBSSwwQkFBc0MsTUFBTTtBQUFBLEVBQUM7QUFFakQsTUFBSTtBQUNKLFFBQU07QUFBQSxPQUNEO0FBQUEsSUFDSCxPQUFPO0FBQUEsTUFDTCxXQUFXLE9BQU8sVUFBVTtBQUMxQixnQ0FBd0I7QUFFeEIsWUFBSSxPQUFPO0FBQ1Qsa0JBQVEsTUFBTSxPQUFNLElBQUksaUJBQWlCLEdBQUcsS0FBSztBQUNqRDtBQUFBLFFBQ0Y7QUFFQSxjQUFNLENBQUMsWUFBWSxRQUFRLE9BQ3pCLHlDQUNGO0FBQ0Esa0NBQTBCO0FBRTFCLFlBQUksTUFBTSxXQUFXLEdBQUc7QUFDdEIsY0FBSTtBQUFPLGtCQUFNLEtBQUs7QUFDdEIsa0JBQVEsZUFBZSxRQUFRO0FBQUEsUUFDakM7QUFFQSxZQUFJO0FBQU8sZ0JBQU0sS0FBSztBQUN0QixnQkFBUSxlQUFlLFFBQVE7QUFBQSxNQUNqQztBQUFBLElBQ0Y7QUFBQSxFQUNGLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDWixZQUFRLElBQUksT0FBTSxhQUFhLDRCQUF1QixDQUFDO0FBQ3ZELFFBQUk7QUFBTyxZQUFNLEtBQUs7QUFDdEIsWUFBUSxlQUFlLFFBQVE7QUFBQSxFQUNqQyxDQUFDO0FBQ0g7QUFFTyxxQkFBcUIsU0FBNkM7QUFDdkUsUUFBTSxpQkFBaUIscUJBQXFCLE9BQU87QUFFbkQsUUFBTSxjQUFjLEVBQ2pCLEtBQUssWUFBWTtBQUNoQixVQUFNLFFBQVEsa0JBQWtCO0FBRWhDLFlBQVEsSUFBSSxPQUFNLE1BQU0sK0JBQStCLENBQUM7QUFBQSxFQUMxRCxDQUFDLEVBQ0EsTUFBTSxDQUFDLFVBQVU7QUFDaEIsWUFBUSxJQUFJO0FBQUEsRUFBSyxPQUFNLElBQUksMkJBQTJCO0FBQUEsR0FBTyxPQUFPLElBQUk7QUFBQSxFQUMxRSxDQUFDO0FBQ0w7OztBR2pFQTtBQUNBO0FBT08sd0JBQ0wsU0FDQSxZQUNBO0FBQ0EsUUFBTSxPQUFPLFFBQVEsUUFBUSxRQUFRLElBQUk7QUFDekMsUUFBTSxXQUFXLE1BQU0sS0FDckIsb0JBQUksSUFBSTtBQUFBLElBQ04sR0FBRyxlQUFlLE9BQ2hCLENBQUMsTUFBTSxDQUFDLHNDQUFzQyxLQUFLLENBQUMsQ0FDdEQ7QUFBQSxJQUNBO0FBQUEsSUFDQSxHQUFJLE1BQU0sUUFBUSxRQUFRLFFBQVEsSUFBSSxRQUFRLFdBQVcsQ0FBQztBQUFBLEVBQzVELENBQUMsQ0FDSDtBQUVBLFFBQU07QUFBQSxJQUNKLFNBQVMsTUFBSyxNQUFNLFVBQVU7QUFBQSxJQUM5QixZQUFZLE1BQUssTUFBTSxtQkFBbUI7QUFBQSxJQUMxQyxjQUFjLE1BQUssTUFBTSxxQkFBcUI7QUFBQSxJQUM5QztBQUFBLElBQ0Esb0JBQW9CLFlBQVk7QUFBQSxJQUFDO0FBQUEsTUFDL0I7QUFFSixRQUFNLEVBQUUsS0FBSyxZQUFZO0FBRXpCLFFBQU0scUNBQ0o7QUFBQSxJQUNFO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBRUYsU0FBTztBQUNUOzs7QUN2Q08sbUNBQ0wsY0FBbUQsQ0FBQyxHQUM1QztBQUNSLE1BQUk7QUFDSixNQUFJO0FBRUosU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sZUFBZSxRQUFRO0FBQ3JCLG1CQUFhO0FBQ2IsZ0JBQVUsZUFBZSxhQUFhLFVBQVU7QUFBQSxJQUNsRDtBQUFBLElBQ0EsaUJBQWlCLENBQUMsRUFBRSxpQkFBZ0M7QUFDbEQsaUJBQVcsR0FBRyxhQUFhLE1BQU07QUFDL0IsY0FBTSxVQUFlLFdBQVcsUUFBUTtBQUN4QyxnQkFBUSxJQUFJLGlCQUFpQixVQUFVLFFBQVEsV0FBVyxRQUFRO0FBRWxFLGtCQUFVLE9BQU87QUFBQSxNQUNuQixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsYUFBYSxNQUFNO0FBQ2pCLGtCQUFZLE9BQU87QUFBQSxJQUNyQjtBQUFBLEVBQ0Y7QUFDRjs7O0FMekJBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU0sTUFBSywyRUFBMkUsWUFBWTtBQUFBLEVBQ2xHLFNBQVM7QUFBQSxJQUNQLGFBQWE7QUFBQSxJQUNiLDBCQUEwQjtBQUFBLE1BQ3hCLE1BQU0sUUFBUSxJQUFJO0FBQUEsTUFDbEIsVUFBVTtBQUFBLE1BQ1YsbUJBQW1CLFlBQVk7QUFDN0IsY0FBTSxZQUFZO0FBQUEsVUFDaEIsVUFBVTtBQUFBLFVBQ1YsUUFBUTtBQUFBLFVBQ1IsVUFBVTtBQUFBLFFBQ1osQ0FBQztBQUNELGNBQU0sWUFBWTtBQUFBLFVBQ2hCLFVBQVU7QUFBQSxVQUNWLFFBQVE7QUFBQSxVQUNSLFVBQVU7QUFBQSxRQUNaLENBQUM7QUFDRCxzQkFDRSx1QkFDQSwyQ0FDRjtBQUNBLHNCQUNFLHlCQUNBLDhDQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLFdBQVcsTUFBSywyRUFBMkUsWUFBWTtBQUFBLE1BQ3ZHLFNBQVMsTUFBSywyRUFBMkUsVUFBVTtBQUFBLE1BQ25HLFdBQVcsTUFBSywyRUFBMkUsWUFBWTtBQUFBLElBQ3pHO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBTTtBQUFBLEVBQ04sT0FBTztBQUFBLElBQ0wsUUFBUSxNQUFLLDJFQUEyRSxZQUFZO0FBQUEsSUFDcEcsYUFBYTtBQUFBLEVBQ2Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
