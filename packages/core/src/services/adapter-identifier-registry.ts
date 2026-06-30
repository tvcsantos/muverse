import { AdapterIdentifierFactory } from "./adapter-identifier-factory.js";
import { AdapterIdentifier } from "./adapter-identifier.js";

/**
 * Registry for managing and discovering adapter identifiers.
 * Provides automatic project adapter detection, fast lookup by ID, and discovery of supported adapters.
 */
export class AdapterIdentifierRegistry {
  /**
   * Internal map of adapter identifiers keyed by their unique ID.
   */
  private readonly identifiers: Map<string, AdapterIdentifier>;

  /**
   * Cached array of all supported adapter IDs.
   */
  private readonly supportedAdapters: string[];

  /**
   * Creates a new adapter identifier registry.
   * @param identifiers - Map of adapter identifiers to register, keyed by their unique ID
   */
  constructor(
    private readonly identifiersFactory: ReadonlyMap<
      string,
      AdapterIdentifierFactory
    >,
  ) {
    this.identifiers = new Map();
    this.supportedAdapters = Array.from(this.identifiersFactory.keys());
  }

  /**
   * Automatically identifies which adapter can handle the specified project.
   * @param projectRoot - The absolute path to the root directory of the project to analyze
   * @returns A promise that resolves to the first matching adapter, or `null` if no adapter can handle the project
   */
  async identify(projectRoot: string): Promise<AdapterIdentifier | null> {
    for (const id of this.supportedAdapters) {
      const identifier = await this.getIdentifierById(id);
      if (!identifier) {
        throw new Error(
          `Adapter identifier for '${id}' is not registered in the registry.`,
        );
      }
      try {
        const result = await identifier.accept(projectRoot);
        if (result) {
          return identifier;
        }
      } catch (_error) {
        // Continue to the next identifier if this one fails
        // This ensures robustness - one faulty adapter won't break discovery
        continue;
      }
    }

    return null;
  }

  /**
   * Retrieves a specific adapter identifier by its unique ID.
   * @param id - The unique identifier of the adapter to retrieve
   * @returns The adapter if found, or `null` if not registered
   */
  async getIdentifierById(id: string): Promise<AdapterIdentifier | null> {
    let identifier = this.identifiers.get(id);
    if (identifier) return identifier;

    const factory = this.identifiersFactory.get(id);
    if (!factory) return null;

    identifier = await factory.create();
    this.identifiers.set(id, identifier);
    return identifier;
  }

  /**
   * Returns a list of all supported adapter IDs in this registry.
   * @returns An array of adapter ID strings
   */
  getSupportedAdapters(): string[] {
    return this.supportedAdapters;
  }
}
