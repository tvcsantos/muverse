import { type ModuleDetector } from "../../../services/module-detector.js";
import { type ModuleRegistry } from "../../../services/module-registry.js";
import { type ModuleSystemFactory } from "../../../services/module-system-factory.js";
import { type VersionUpdateStrategy } from "../../../services/version-update-strategy.js";
import { ManualModuleDetector } from "./manual-module-detector.js";
import { ManualVersionUpdateStrategy } from "./manual-version-update-strategy.js";

/**
 * Factory for creating Manually configured module system components.
 */
export class ManualModuleSystemFactory implements ModuleSystemFactory {
  /** Absolute path to the repository root directory. */
  constructor(
    private readonly repoRoot: string,
    private readonly configDirectory: string,
  ) {}

  async createDetector(_outputFile: string): Promise<ModuleDetector> {
    return new ManualModuleDetector(this.repoRoot, this.configDirectory);
  }

  async createVersionUpdateStrategy(
    _moduleRegistry: ModuleRegistry,
  ): Promise<VersionUpdateStrategy> {
    return new ManualVersionUpdateStrategy(
      this.configDirectory,
    );
  }
}
