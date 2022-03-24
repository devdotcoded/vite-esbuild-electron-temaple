import { Configuration as ElectronBuilderConfiguration } from "electron-builder"

export interface ViteElectronBuilderOptions {
    root?: string;
    outdir?: string;
    entryFile?: string;
    preloadFile?: string;
    tsconfig?: string;
    external?: string[];
    electronBuilderConfig?: string | ElectronBuilderConfiguration;
    afterEsbuildBuild?: () => Promise<void>
}

export interface ResolvedViteElectronBuilderOptions extends Required<ViteElectronBuilderOptions> {
    env: Record<string, any>;
    command: 'build' | 'serve';
}