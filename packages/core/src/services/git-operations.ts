import { logger } from "../utils/logger.js";
import { ModuleChangeResult } from "./version-applier.js";
import {
  addChangedFiles,
  commitChanges,
  pushCommits,
  hasChangesToCommit,
  createTag,
  pushTags,
  pushTag,
} from "../git/index.js";

export type GitOperationsOptions = {
  createTags: boolean;
  pushChanges: boolean;
  repoRoot: string;
  dryRun: boolean;
  isTemporaryVersion: boolean;
  sequentialTagPush: boolean;
  commitReleaseNotes: boolean;
  releaseNotesFilename: string;
};

export type CreatedTagResult = {
  moduleId: string;
  tag: string;
};

export class GitOperations {
  constructor(private readonly options: GitOperationsOptions) {}

  async commitAndPushChanges(
    moduleChangeResults: ModuleChangeResult[],
  ): Promise<void> {
    if (!this.options.pushChanges) {
      logger.info("Push disabled, skipping commit and push");
      return;
    }

    if (this.options.dryRun) {
      const commitMessage = this.createCommitMessage(moduleChangeResults);
      logger.info("Dry run enabled, skipping commit and push", {
        message: commitMessage,
      });
      return;
    }

    logger.info("Committing and pushing changes");

    try {
      // Add all changed files to staging area
      const ignorePaths: string[] = [];

      if (!this.options.commitReleaseNotes) {
        logger.info("Skipping commit of release notes", {
          filename: this.options.releaseNotesFilename,
        });

        // Add both root and recursive variants so git pathspec exclusions
        // cover RELEASE.md in repository root and any subdirectories.
        ignorePaths.push(this.options.releaseNotesFilename);
        ignorePaths.push(`**/${this.options.releaseNotesFilename}`);
      }

      await addChangedFiles({ cwd: this.options.repoRoot }, ignorePaths);

      // Check if there are any changes to commit
      const hasChanges = await hasChangesToCommit({
        cwd: this.options.repoRoot,
      });

      if (hasChanges) {
        // Create commit message
        const commitMessage = this.createCommitMessage(moduleChangeResults);

        // Commit changes
        await commitChanges(commitMessage, { cwd: this.options.repoRoot });
        logger.info("Changes committed", { message: commitMessage });

        // Push commits to remote
        await pushCommits({ cwd: this.options.repoRoot });
        logger.info("Commits pushed to remote");
      } else {
        logger.info("Nothing staged for commit");
      }
    } catch (error) {
      logger.warning("Failed to commit and push changes", { error });
      // Continue execution - don't fail the entire process if git operations fail
    }
  }

  async createAndPushTags(
    moduleChangeResults: ModuleChangeResult[],
  ): Promise<CreatedTagResult[]> {
    const createdTags: CreatedTagResult[] = [];

    if (!this.options.createTags) {
      logger.info("Tag creation disabled, skipping tag creation and push");
      return createdTags;
    }

    if (this.options.isTemporaryVersion) {
      logger.info("Temporary version detected, skipping tag creation and push");
      return createdTags;
    }

    const disabledBy = [
      this.options.dryRun && "dry-run",
      !this.options.pushChanges && "push-changes",
    ]
      .filter(Boolean)
      .join(", ");

    logger.info("Filtering modules with declared versions");

    const modulesWithDeclaredVersions = moduleChangeResults.filter(
      (change) => change.declaredVersion,
    );

    if (disabledBy) {
      logger.info("Tag push disabled, skipping tag creation and push", {
        disabledBy,
      });

      for (const change of modulesWithDeclaredVersions) {
        const tagName = `${change.name}@${change.to}`;
        createdTags.push({ moduleId: change.id, tag: tagName });
        logger.info("Would create tag (dry run)", { tag: tagName });
      }

      return createdTags;
    }

    for (const change of modulesWithDeclaredVersions) {
      const tagName = `${change.name}@${change.to}`;
      const message = `Release ${change.name} v${change.to}`;

      await createTag(tagName, message, { cwd: this.options.repoRoot });
      createdTags.push({ moduleId: change.id, tag: tagName });
      logger.debug("Tag created", { tag: tagName });
    }
    logger.info("Created tags", { count: createdTags.length });

    // Push tags
    logger.info("Pushing tags to remote", {
      tagCount: createdTags.length,
      sequential: this.options.sequentialTagPush,
    });

    if (this.options.sequentialTagPush) {
      for (const { tag } of createdTags) {
        await pushTag(tag, { cwd: this.options.repoRoot });
        logger.info("Tag pushed to remote", { tag });
      }
    } else {
      await pushTags({ cwd: this.options.repoRoot });
    }

    logger.info("Tags pushed to remote", { tagCount: createdTags.length });

    return createdTags;
  }

  private createCommitMessage(
    moduleChangeResults: ModuleChangeResult[],
  ): string {
    const moduleNames = moduleChangeResults.map((change) => change.name);

    return moduleNames.length === 1
      ? `chore(release): ${moduleNames[0]} ${moduleChangeResults[0]!.to}`
      : `chore(release): update ${moduleNames.length} modules`;
  }
}
