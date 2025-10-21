import { Config } from "../config/index.js";
import { BumpType } from "../semver/index.js";

/**
 * Valid bump type values for general configuration options.
 * Includes: major, minor, patch, none, ignore.
 */
const validBumpTypes: (BumpType | 'ignore')[] = ['major', 'minor', 'patch', 'none', 'ignore'];

/**
 * Valid bump type values for dependency-related rules.
 * Excludes 'ignore' since dependency updates should always be considered.
 */
const validDepBumpTypes: BumpType[] = ['major', 'minor', 'patch', 'none'];

/**
 * Validates VERSE configuration for correctness and consistency.
 * Checks default bump types, commit type mappings, and dependency rules.
 */
export class ConfigurationValidator {

    /**
     * Validates the provided configuration.
     * @param config - Configuration object to validate
     * @throws {Error} If any configuration value is invalid
     */
    validate(config: Config): void {
      // Validate default bump type
      if (!validBumpTypes.includes(config.defaultBump)) {
        throw new Error(`Invalid defaultBump: ${config.defaultBump}`);
      }
      
      // Validate all commit type mappings
      for (const [commitType, bumpType] of Object.entries(config.commitTypes)) {
        if (!validBumpTypes.includes(bumpType)) {
          throw new Error(`Invalid bump type for commit type '${commitType}': ${bumpType}`);
        }
      }
      
      const depRules = config.dependencyRules;
      
      // Validate dependency rule for major version bumps
      if (!validDepBumpTypes.includes(depRules.onMajorOfDependency)) {
        throw new Error(`Invalid onMajorOfDependency: ${depRules.onMajorOfDependency}`);
      }
      
      // Validate dependency rule for minor version bumps
      if (!validDepBumpTypes.includes(depRules.onMinorOfDependency)) {
        throw new Error(`Invalid onMinorOfDependency: ${depRules.onMinorOfDependency}`);
      }
      
      // Validate dependency rule for patch version bumps
      if (!validDepBumpTypes.includes(depRules.onPatchOfDependency)) {
        throw new Error(`Invalid onPatchOfDependency: ${depRules.onPatchOfDependency}`);
      }
    }
}