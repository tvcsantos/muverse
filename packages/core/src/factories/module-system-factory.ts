import { AdapterPluginContract } from "../plugins/types.js";
import { ModuleSystemFactory } from "../services/module-system-factory.js";

/**
 * Creates the appropriate module system factory for a given adapter.
 * @param adapterName - The identifier of the build system adapter (e.g., 'gradle', 'maven', 'npm')
 * @param repoRoot - The absolute path to the repository root directory
 * @returns A ModuleSystemFactory instance configured for the specified adapter
 * @throws {Error} If the adapter name is not recognized or supported
 */
export async function createModuleSystemFactory(
  adapterName: string,
  adapterPlugins: AdapterPluginContract[],
  repoRoot: string,
  configDirectory: string,
): Promise<ModuleSystemFactory> {
  const lowerCasedAdapterName = adapterName.toLowerCase();
  const candidatePlugin = adapterPlugins.find(
    (plugin) => plugin.id.toLowerCase() === lowerCasedAdapterName,
  );
  if (!candidatePlugin) {
    throw new Error(`Unsupported adapter: ${adapterName}`);
  }
  return await candidatePlugin.moduleSystemFactory(repoRoot, configDirectory);
}
