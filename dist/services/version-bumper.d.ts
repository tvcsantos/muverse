import { ProcessedModuleChange, CommitInfo } from '../adapters/core.js';
import { Config } from '../config/index.js';
import { ModuleRegistry } from './module-registry.js';
import { AdapterMetadata } from './adapter-identifier.js';
export type VersionBumperOptions = {
    prereleaseMode: boolean;
    bumpUnchanged: boolean;
    addBuildMetadata: boolean;
    appendSnapshot: boolean;
    adapter: AdapterMetadata;
    timestampVersions: boolean;
    prereleaseId: string;
    repoRoot: string;
};
export declare class VersionBumper {
    private readonly moduleRegistry;
    private readonly options;
    constructor(moduleRegistry: ModuleRegistry, options: VersionBumperOptions);
    calculateVersionBumps(moduleCommits: Map<string, CommitInfo[]>, config: Config): Promise<ProcessedModuleChange[]>;
    private calculateInitialBumps;
    private applyVersionCalculations;
}
//# sourceMappingURL=version-bumper.d.ts.map