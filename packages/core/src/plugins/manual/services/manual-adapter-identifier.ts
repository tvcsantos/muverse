import {
  type AdapterMetadata,
  type AdapterIdentifier,
} from "../../../services/adapter-identifier.js";
import { logger } from "../../../utils/logger.js";

/**
 * Adapter identifier for Manually configured projects.
 * Detects Manually configured projects by looking for project-information.json in the config directory.
 */
export class ManualAdapterIdentifier implements AdapterIdentifier {
  constructor(
    readonly metadata: AdapterMetadata,
    private readonly hasProjectInformationFile: boolean,
  ) {}

  /**
   * Determines whether the specified project is a Manual configured project.
   * @param projectRoot - Absolute path to the project root directory
   * @returns True if there is a project-information.json file in the config directory, false otherwise
   */
  async accept(_projectRoot: string): Promise<boolean> {
    logger.debug("Project information file", {
      hasProjectInformationFile: this.hasProjectInformationFile,
    });
    return this.hasProjectInformationFile;
  }
}
