import { type RawProjectInformation } from "../../adapters/project-information.js";
import { type AdapterCapabilities } from "../../services/adapter-identifier.js";

export type ManualProjectInformation = RawProjectInformation & {
  capabilities: AdapterCapabilities;
};
