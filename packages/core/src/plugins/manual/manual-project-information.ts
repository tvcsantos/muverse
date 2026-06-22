import { type RawProjectInformation } from "../../adapters/project-information.js";
import { type AdapterCapabilities } from "../../services/adapter-identifier.js";
import { Data } from "../../utils/data.js";

export type ManualProjectInformation = Data<RawProjectInformation> & {
  capabilities: AdapterCapabilities;
};
