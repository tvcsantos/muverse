import { PluginContract } from "../plugins/types.js";
import { AdapterIdentifierFactory } from "../services/adapter-identifier-factory.js";
import { AdapterIdentifierRegistry } from "../services/adapter-identifier-registry.js";

/**
 * Creates and configures the global adapter identifier registry.
 *
 * @returns Configured {@link AdapterIdentifierRegistry} with all available adapters
 */
export async function createAdapterIdentifierRegistry(
  plugins: PluginContract[],
  configDirectory: string,
): Promise<AdapterIdentifierRegistry> {
  // Array of all registered adapter identifiers
  // Order matters: first matching adapter is selected during auto-detection
  const identifiersFactoryMap: Map<string, AdapterIdentifierFactory> =
    new Map();
  const adapters = plugins.flatMap((x) => x.adapters);
  for (const adapter of adapters) {
    const adapterIdentifierFactory =
      await adapter.adapterIdentifierFactory(configDirectory);
    identifiersFactoryMap.set(
      adapterIdentifierFactory.id,
      adapterIdentifierFactory,
    );
  }

  // Create and return the registry with all registered identifiers
  return new AdapterIdentifierRegistry(identifiersFactoryMap);
}
