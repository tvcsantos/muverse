import { exists, getProjectInformationPath, readRawProjectInformation } from "../../../index.js";
import { AdapterIdentifierFactory } from "../../../services/adapter-identifier-factory.js";
import {
  type AdapterMetadata,
  type AdapterIdentifier,
} from "../../../services/adapter-identifier.js";
import { logger } from "../../../utils/logger.js";
import { MANUAL_ID } from "../constants.js";
import { ManualProjectInformation } from "../manual-project-information.js";

export class ManualAdapterIdentifierFactory implements AdapterIdentifierFactory {

  readonly id: string = MANUAL_ID;

  constructor(
    private readonly configDirectory: string,
  ) {}

  async create(): Promise<AdapterIdentifier> {
    const projectInformationPath = getProjectInformationPath(this.configDirectory);

    const hasProjectInformationFile = await exists(projectInformationPath);

    if (!hasProjectInformationFile) {
      throw new Error("Project Information file not found");
    }

    const projectInformation: ManualProjectInformation =
      await readRawProjectInformation(this.configDirectory);

    const metadata: AdapterMetadata = {
      id: MANUAL_ID,
      capabilities: projectInformation.capabilities,
    };

    return new ManualAdapterIdentifier(metadata, true);
  }
}

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
