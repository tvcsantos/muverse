import * as core from '@actions/core';
import { Config, DEFAULT_CONFIG } from '../config/index.js';
import { cosmiconfig } from 'cosmiconfig';
import deepmerge from 'deepmerge';
import { exists } from '../utils/file.js';
import { join } from 'path';
import { ConfigurationValidator } from './configuration-validator.js';

/**
 * Loads and merges VERSE configuration from various sources (.verserc, verse.config.js, package.json).
 * Uses cosmiconfig for auto-discovery and merges user config with defaults.
 */
export class ConfigurationLoader {

  /**
   * Creates a new configuration loader.
   * @param configurationValidator - Validator to ensure configuration integrity
   */
  constructor(private readonly configurationValidator: ConfigurationValidator) {}

  /**
   * Loads and validates the VERSE configuration.
   * @param configPath - Optional relative path to a specific configuration file
   * @param repoRoot - Optional absolute path to the repository root directory
   * @returns A promise that resolves to the fully merged and validated configuration
   * @throws {Error} If configuration loading or validation fails
   */
  async load(configPath?: string, repoRoot?: string): Promise<Config> {    
    try {
      core.info(`🔍 Searching for VERSE configuration...`);
      
      // Initialize cosmiconfig explorer for 'verse' module
      const explorer = cosmiconfig('verse');

      let result;
      
      if (configPath && repoRoot) {
        // If specific config path provided, try to load it
        const fullPath = join(repoRoot, configPath);
        if (await exists(fullPath)) {
          result = await explorer.load(fullPath);
        } else {
          // Fallback to auto-discovery if specified file doesn't exist
          core.info(`Specified config file not found at ${configPath}, searching for config files...`);
          result = await explorer.search(repoRoot);
        }
      } else {
        // Search for config in standard locations
        const searchStart = repoRoot || process.cwd();
        result = await explorer.search(searchStart);
      }

      let config: Config;
      
      if (result?.config) {
        // Configuration found - merge, validate, and use it
        const configSource = result.filepath ? `from ${result.filepath}` : 'from package.json';
        core.info(`📋 Configuration loaded ${configSource}`);
        
        const userConfig = result.config;
        const validatedConfig = mergeConfig(DEFAULT_CONFIG, userConfig);
        this.configurationValidator.validate(validatedConfig);

        config = validatedConfig;
      } else {
        // No configuration found - use defaults
        core.info(`No configuration found, using defaults`);
        config = DEFAULT_CONFIG;
      }

      core.info(`✅ Configuration loaded successfully`);

      return config;

    } catch (error) {
      // Wrap any errors with context for better debugging
      throw new Error(`Failed to load configuration: ${error}`);
    }
  }
}

/**
 * Merges user configuration with default configuration.
 * @param defaultConfig - The default configuration to use as a base
 * @param userConfig - The user-provided configuration to merge
 * @returns The merged configuration (user values override defaults, arrays are replaced)
 */
function mergeConfig(defaultConfig: Config, userConfig: Partial<Config>): Config {
  return deepmerge(defaultConfig, userConfig, {
    // Custom merge for arrays - replace instead of concatenating
    // This ensures user arrays override defaults completely
    arrayMerge: (target, source) => source,
  }) as Config;
}
