#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJsonPath = join(__dirname, '../package.json');
const versionFilePath = join(__dirname, '../src/utils/version.ts');

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;
const packageName = packageJson.name;
let authors = [];

const localAuthors = packageJson.authors;
if (Array.isArray(localAuthors)) {
    authors = localAuthors
} else if (localAuthors !== undefined) {
    authors = localAuthors.split(/[, ]/).filter(Boolean)
} else if (packageJson.author) {
    authors.push(packageJson.author)
} else {
    authors.push('Unknown Author')
}

const content = `// This file is auto-generated. Do not edit manually.
// Run 'npm run generate-version' to update this file.
export const VERSION = "${version}";
export const PACKAGE_NAME = "${packageName}";
export const AUTHORS = ${JSON.stringify(authors)};
`;

mkdirSync(join(__dirname, '../src/utils'), { recursive: true });
writeFileSync(versionFilePath, content, 'utf-8');
console.log(`✓ Generated version.ts with version ${version} and package ${packageName}`);
