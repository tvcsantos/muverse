import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// package.json ships with the action checkout, one level above this
// module (src or dist), so reading it at runtime keeps the reported
// version from drifting from the released one.
const manifest: { name: string; version: string } = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../package.json'),
    'utf-8',
  ),
);

export const VERSION = manifest.version;
export const PACKAGE_NAME = manifest.name;
