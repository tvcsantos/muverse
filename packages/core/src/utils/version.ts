import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

type PackageManifest = {
  name: string;
  version: string;
  author?: string;
  authors?: string[] | string;
};

/**
 * Reads the nearest package.json above this module at runtime.
 *
 * @remarks
 * package.json ships with the published package, normally two levels above
 * this module (src/utils or dist/utils). A fixed relative path cannot be
 * used here because core also gets bundled into the GitHub Action's
 * dist/index.cjs, where walking upwards finds the action's own
 * package.json instead.
 */
function readNearestPackageManifest(): PackageManifest {
  let directory = dirname(fileURLToPath(import.meta.url));

  for (;;) {
    const manifestPath = join(directory, "package.json");
    if (existsSync(manifestPath)) {
      return JSON.parse(readFileSync(manifestPath, "utf-8"));
    }

    const parent = dirname(directory);
    if (parent === directory) {
      throw new Error("Could not find a package.json to read the version from");
    }
    directory = parent;
  }
}

function resolveAuthors(manifest: PackageManifest): string[] {
  if (Array.isArray(manifest.authors)) {
    return manifest.authors;
  }
  if (manifest.authors !== undefined) {
    return manifest.authors.split(/[, ]/).filter(Boolean);
  }
  if (manifest.author) {
    return [manifest.author];
  }
  return ["Unknown Author"];
}

const manifest = readNearestPackageManifest();

export const VERSION = manifest.version;
export const PACKAGE_NAME = manifest.name;
export const AUTHORS = resolveAuthors(manifest);
