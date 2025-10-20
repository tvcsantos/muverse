import { ModuleDetector } from "../../../services/module-detector.js";
import { ModuleRegistry } from '../../../services/module-registry.js';
export declare class GradleModuleDetector implements ModuleDetector {
    readonly repoRoot: string;
    constructor(repoRoot: string);
    detect(): Promise<ModuleRegistry>;
}
//# sourceMappingURL=gradle-module-detector.d.ts.map