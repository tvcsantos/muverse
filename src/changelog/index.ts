import { promises as fs } from 'fs';
import { join } from 'path';
import { ModuleChangeResult } from '../services/version-applier.js';
import { CommitInfo } from '../git/index.js';
import conventionalChangelogWriter from 'conventional-changelog-writer';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import gitRawCommits, { getRawCommits } from 'git-raw-commits';
import conventionalCommitsParser from 'conventional-commits-parser';
import { exists } from '../utils/file.js';

export type ChangelogEntry = {
  readonly moduleResult: ModuleChangeResult;
  readonly version: string;
  readonly date: string;
  readonly changes: {
    readonly breaking: CommitInfo[];
    readonly features: CommitInfo[];
    readonly fixes: CommitInfo[];
    readonly other: CommitInfo[];
  };
};

export type ChangelogOptions = {
  readonly includeCommitHashes: boolean;
  readonly includeScopes: boolean;
  readonly groupByType: boolean;
};


const CHANGELOG_FILE = 'CHANGELOG.md';

async function generateChangelogSection(commits: CommitInfo[]): Promise<string> {
  const chunks: Buffer[] = [];
  await pipeline(
    /*getRawCommits({ from: 'v1.2.2', to: 'HEAD' }), // or set range
    conventionalCommitsParser(),*/
    Readable.from(commits),
    conventionalChangelogWriter(),
    async function* (source) {
      for await (const chunk of source) chunks.push(chunk);
    }
  );

  return Buffer.concat(chunks).toString('utf8');
}

async function prependToChangelog(newSection: string, path: string) {
  const changelogPath = join(path, CHANGELOG_FILE);

  let existing = '';

  const hasChangelog = await exists(changelogPath);
  if (hasChangelog) {
    existing = await fs.readFile(changelogPath, 'utf8');
  }

  const updated = `${newSection.trim()}\n\n${existing.trim()}\n`;
  await fs.writeFile(changelogPath, updated, 'utf8');

  return changelogPath;
}

/** Generate changelog for multiple modules. */
export async function generateChangelogsForModules(
  moduleResults: ModuleChangeResult[],
  getCommitsForModule: (moduleId: string) => Promise<CommitInfo[]>,
): Promise<string[]> {
  const changelogPaths: string[] = [];

  for (const moduleResult of moduleResults) {
    const commits = await getCommitsForModule(moduleResult.id);
    const changelogContent = await generateChangelogSection(
      commits
    );

    const changelogPath = await prependToChangelog(
      changelogContent,
      moduleResult.path
    );

    changelogPaths.push(changelogPath);
  }

  return changelogPaths;
}

/** Generate a root changelog that summarizes all module changes. */
export async function generateRootChangelog(
  moduleResults: ModuleChangeResult[],
  repoRoot: string
): Promise<string> {
  const rootChangelogPath = join(repoRoot, 'CHANGELOG.md');
  const date = new Date().toISOString().split('T')[0];
  
  let content = `## ${date}\n\n`;
  
  if (moduleResults.length === 0) {
    content += 'No changes in this release.\n\n';
  } else {
    content += '### Module Updates\n\n';
    
    for (const moduleResult of moduleResults) {
      const fromVersion = moduleResult.from;
      const toVersion = moduleResult.to;
      const moduleName = moduleResult.id === 'root' ? 'Root' : moduleResult.id;
      
      content += `- **${moduleName}**: ${fromVersion} → ${toVersion}\n`;
    }
    content += '\n';
  }

  try {
    const existingContent = await fs.readFile(rootChangelogPath, 'utf8');
    const lines = existingContent.split('\n');
    
    // Find insertion point (after main heading)
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('## ') && i > 0) {
        insertIndex = i;
        break;
      }
    }
    
    const beforeInsert = lines.slice(0, insertIndex);
    const afterInsert = lines.slice(insertIndex);
    
    const updatedContent = [
      ...beforeInsert,
      content.trim(),
      '',
      ...afterInsert
    ].join('\n');
    
    await fs.writeFile(rootChangelogPath, updatedContent, 'utf8');
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as any).code === 'ENOENT') {
      const newContent = `# Changelog\n\n${content}`;
      await fs.writeFile(rootChangelogPath, newContent, 'utf8');
    } else {
      throw error;
    }
  }

  return rootChangelogPath;
}
