import * as fs from "fs/promises";
import { type VersionUpdateStrategy } from "../../../services/version-update-strategy.js";
import {
  type RawModule,
} from "../../../adapters/project-information.js";
import {
  type ManualProjectInformation,
} from "../manual-project-information.js";
import { type Mutable } from "../../../utils/mutable.js";
import { getProjectInformationPath, readRawProjectInformation } from "../../../services/project-information.js";

export class ManualVersionUpdateStrategy implements VersionUpdateStrategy {
  constructor(private readonly configDirectory: string) {}

  async writeVersionUpdates(
    moduleVersions: Map<string, string>,
  ): Promise<void> {
    const rawProjectInformation: Mutable<ManualProjectInformation> =
      await readRawProjectInformation(this.configDirectory);

    for (const [moduleId, newVersion] of moduleVersions) {
      const module: Mutable<RawModule> | undefined =
        rawProjectInformation[moduleId];
      if (!module) {
        throw new Error(`Module ${moduleId} not found in project information`);
      }
      module.version = newVersion;
    }

    const projectInformationPath = getProjectInformationPath(
      this.configDirectory,
    );

    await fs.writeFile(
      projectInformationPath,
      JSON.stringify(rawProjectInformation, null, 2),
      "utf-8",
    );
  }
}
