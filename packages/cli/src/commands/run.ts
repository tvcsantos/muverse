import { Args, Command, Flags } from "@oclif/core";
import { OclifLogger } from "../logger.js";
import { initLogger, logger, RunnerOptions, VersuRunner } from "@versu/core";

export default class Run extends Command {
  static override description = "Calculate and apply semantic version changes";

  static override examples = [
    "<%= config.bin %> <%= command.id %>",
    "<%= config.bin %> <%= command.id %> --adapter gradle",
    "<%= config.bin %> <%= command.id %> --dry-run",
    "<%= config.bin %> <%= command.id %> --prerelease-mode --prerelease-id alpha",
  ];

  static args = {
    repositoryRoot: Args.directory({
      required: false,
      description: "Path to the repository root",
      default: ".",
    }),
  };

  static override flags = {
    "prerelease-mode": Flags.boolean({
      description: "Generate pre-release versions instead of final versions",
      default: false,
    }),
    "prerelease-id": Flags.string({
      description: "Pre-release identifier (e.g., alpha, beta, rc)",
      default: "alpha",
    }),
    "bump-unchanged": Flags.boolean({
      description:
        "In prerelease mode, bump modules even when no changes are detected",
      default: false,
    }),
    "add-build-metadata": Flags.boolean({
      description: "Add build metadata with short SHA to all versions",
      default: false,
    }),
    "timestamp-versions": Flags.boolean({
      description:
        "Use timestamp-based prerelease identifiers (requires prerelease-mode)",
      default: false,
    }),
    "append-snapshot": Flags.boolean({
      description:
        "Add -SNAPSHOT suffix to all versions if supported by adapter",
      default: false,
    }),
    "create-tags": Flags.boolean({
      description: "Create git tags for new versions",
      default: true,
      allowNo: true,
    }),
    "generate-changelog": Flags.boolean({
      description: "Generate or update changelog files for changed modules",
      default: true,
      allowNo: true,
    }),
    "generate-release-notes": Flags.boolean({
      description: "Generate release notes summarizing all changes",
      default: true,
      allowNo: true,
    }),
    "push-changes": Flags.boolean({
      description: "Commit and push version changes and changelogs to remote",
      default: true,
      allowNo: true,
    }),
    "dry-run": Flags.boolean({
      description: "Run without writing or pushing changes",
      default: false,
    }),
    "sequential-tag-push": Flags.boolean({
      description:
        "Push tags sequentially instead of all at once (useful for large repositories or certain CI environments)",
      default: false,
    }),
    "commit-release-notes": Flags.boolean({
      description: "Include release notes in the commit when pushing changes",
      default: false,
    }),
    adapter: Flags.string({
      description:
        "Language adapter (e.g., gradle). Auto-detected if not provided",
      required: false,
    }),
    "changelog-filename": Flags.string({
      description: "Filename for generated changelog (default: CHANGELOG.md)",
      default: "CHANGELOG.md",
    }),
    "release-notes-filename": Flags.string({
      description: "Filename for generated release notes (default: RELEASE.md)",
      default: "RELEASE.md",
    }),
    "from-ref": Flags.string({
      description:
        "Git reference to compare from (e.g., previous tag or commit SHA)",
      required: false,
    }),
    provider: Flags.string({
      description: "Version control provider (e.g., github, gitlab)",
      required: false,
    }),
    "strip-module-prefix": Flags.boolean({
      description:
        "Strip module name from tag, when the project has a single module (default: false)",
      default: false,
    }),
    "tag-version-prefix": Flags.string({
      description: "Prefix to add on tag versions (e.g., 'v', default: empty)",
      required: false,
      default: "",
    }),
  };

  async run(): Promise<void> {
    const { flags, args } = await this.parse(Run);

    initLogger(new OclifLogger(this));

    try {
      const options: RunnerOptions = {
        repoRoot: args.repositoryRoot,
        prereleaseMode: flags["prerelease-mode"],
        prereleaseId: flags["prerelease-id"],
        bumpUnchanged: flags["bump-unchanged"],
        addBuildMetadata: flags["add-build-metadata"],
        timestampVersions: flags["timestamp-versions"],
        appendSnapshot: flags["append-snapshot"],
        createTags: flags["create-tags"],
        generateChangelog: flags["generate-changelog"],
        generateReleaseNotes: flags["generate-release-notes"],
        pushChanges: flags["push-changes"],
        adapter: flags.adapter,
        dryRun: flags["dry-run"],
        sequentialTagPush: flags["sequential-tag-push"],
        commitReleaseNotes: flags["commit-release-notes"],
        stripModulePrefix: flags["strip-module-prefix"],
        tagVersionPrefix: flags["tag-version-prefix"],
        changelogFilename: flags["changelog-filename"],
        releaseNotesFilename: flags["release-notes-filename"],
        fromRef: flags["from-ref"],
        provider: flags["provider"],
      };

      const runner = new VersuRunner(options);
      await runner.run();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error("Command failed", { error: errorMessage });
    }
  }
}
