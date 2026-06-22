import {
} from "../manual-project-information.js";
import { type ModuleDetector } from "../../../services/module-detector.js";
import {
  type ProjectInformation,
  type RawProjectInformation,
} from "../../../adapters/project-information.js";
import { getProjectInformationFromRawData, readRawProjectInformation } from "../../../services/project-information.js";
import { Data } from "../../../utils/data.js";

/**
 * Module detector for Manually configured projects.
 * Parses project-information.json files to discover all modules and their dependencies.
 */
export class ManualModuleDetector implements ModuleDetector {
  /** Absolute path to the repository root directory. */
  constructor(
    readonly repoRoot: string,
    private readonly configDirectory: string,
  ) {}

  async detect(): Promise<ProjectInformation> {
    const rawProjectInformation: Data<RawProjectInformation> =
      await readRawProjectInformation(this.configDirectory);
    return getProjectInformationFromRawData(rawProjectInformation.data);
  }
}
