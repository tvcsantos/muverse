import { ManualAdapterIdentifierFactory } from "./services/manual-adapter-identifier.js";
import { ManualModuleSystemFactory } from "./services/manual-module-system-factory.js";
import { AUTHORS, VERSION } from "../../utils/version.js";
import { MANUAL_ID } from "./constants.js";
import { OrderedPluginContract } from "../types.js";
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
      adapterIdentifierFactory: async (configDirectory: string) => 
        new ManualAdapterIdentifierFactory(configDirectory),
      moduleSystemFactory: async (repoRoot: string, configDirectory: string) =>
        new ManualModuleSystemFactory(repoRoot, configDirectory),
    },
  ],
  order: LOWEST_PRECEDENCE,
};

export default manualPlugin;
