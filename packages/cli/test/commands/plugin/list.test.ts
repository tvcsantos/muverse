import { Config } from "@oclif/core";
import { describe, expect, it, vi } from "vitest";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("plugin list", () => {
  it("runs plugin list cmd", async () => {
    const logs: string[] = [];
    vi.spyOn(console, "log").mockImplementation((...args) => {
      logs.push(args.join(" "));
    });

    const config = await Config.load({ root });
    await config.runCommand("plugin:list");

    vi.restoreAllMocks();

    expect(logs.join("\n")).toContain("Installed plugins:");
  });
});
