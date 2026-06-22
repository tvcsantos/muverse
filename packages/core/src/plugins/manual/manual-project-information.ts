import { type RawProjectInformation } from "../../adapters/project-information";
import { type AdapterCapabilities } from "../../services/adapter-identifier";

export type ManualProjectInformation = RawProjectInformation & {
  capabilities: AdapterCapabilities;
};
