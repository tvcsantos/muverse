import { AdapterIdentifier } from "../services/adapter-identifier.js";
import { ModuleSystemFactory } from "../services/module-system-factory.js";
import { Ordered } from "../utils/ordered.js";

export type PluginContract = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly authors: string[];
  readonly adapters: AdapterPluginContract[];
};

export type OrderedPluginContract = PluginContract & Ordered;

export type AdapterPluginContract = {
  readonly id: string;
  adapterIdentifier: (configDirectory: string) => Promise<AdapterIdentifier>;
  moduleSystemFactory: (
    repoRoot: string,
    configDirectory: string,
  ) => Promise<ModuleSystemFactory>;
};

export type PluginInformation = {
  readonly name: string;
  readonly path: string;
  readonly global: boolean;
};

export interface PluginLoader {
  /**
   * Returns the plugins already ordered
   */
  get plugins(): OrderedPluginContract[];
  loadByName(pluginNames: string[]): Promise<void>;
  loadDirect(plugins: OrderedPluginContract[]): Promise<void>;
}

export interface PluginManager {
  list(): Promise<PluginInformation[]>;
  install(pluginName: string, global?: boolean): Promise<void>;
  uninstall(pluginName: string, global?: boolean): Promise<void>;
}
