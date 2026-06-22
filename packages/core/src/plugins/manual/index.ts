import { ManualAdapterIdentifier } from "./services/manual-adapter-identifier.js";
import { ManualModuleSystemFactory } from "./services/manual-module-system-factory.js";
import { AUTHORS, VERSION } from "../../utils/version.js";
import { MANUAL_ID } from "./constants.js";
import {
  getProjectInformationPath,
  readRawProjectInformation,
} from "../../services/project-information.js";
import { OrderedPluginContract } from "../types.js";
import { exists } from "../../utils/file.js";
import { ManualProjectInformation } from "./manual-project-information.js";
import { AdapterMetadata } from "../../services/adapter-identifier.js";
import { LOWEST_PRECEDENCE } from "../plugin-loader.js";

const manualPlugin: OrderedPluginContract = {
  id: MANUAL_ID,
  name: "Manual",
  description:
    "Adapter plugin for Manually configured projects build system. " +
    "Provides support for detecting and updating versions in Manully configured projects.",
  version: VERSION,
  authors: AUTHORS,
  adapters: [
    {
      id: MANUAL_ID,
      adapterIdentifier: async (configDirectory: string) => {
        const projectInformationPath =
          getProjectInformationPath(configDirectory);

        const hasProjectInformationFile = await exists(projectInformationPath);

        if (!hasProjectInformationFile) {
          throw new Error("Project Information file not found");
        }

        const projectInformation: ManualProjectInformation =
          await readRawProjectInformation(configDirectory);

        const metadata: AdapterMetadata = {
          id: MANUAL_ID,
          capabilities: projectInformation.capabilities,
        };

        return new ManualAdapterIdentifier(metadata, true);
      },
      moduleSystemFactory: async (repoRoot: string, configDirectory: string) =>
        new ManualModuleSystemFactory(repoRoot, configDirectory),
    },
  ],
  order: LOWEST_PRECEDENCE,
};

export default manualPlugin;
