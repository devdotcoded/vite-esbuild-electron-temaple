export interface ViteElectronBuilderOptions {
  root?: string;
  outdir?: string;
  entryFile?: string;
  preloadFile?: string;
  tsconfig?: string;
  external?: string[];
  afterEsbuildBuild?: () => Promise<void>;
}

export interface ResolvedViteElectronBuilderOptions
  extends Required<ViteElectronBuilderOptions> {
  env: Record<string, any>;
  command: "build" | "serve";
}
