import * as path from "path";
import * as fs from "fs/promises";
import {
  Module,
  ProjectInformation,
  RawProjectInformation,
} from "../adapters/project-information.js";
import { createInitialVersion, parseSemVer } from "../semver/index.js";
import { Data } from "../utils/data.js";

export function getProjectInformationPath(configDirectory: string): string {
  return path.resolve(path.join(configDirectory, "project-information.json"));
}

export async function readRawProjectInformation<
  T extends Data<RawProjectInformation>,
>(configDirectory: string): Promise<T> {
  const projectInformationPath = getProjectInformationPath(configDirectory);
  const content = await fs.readFile(projectInformationPath, "utf8");
  return JSON.parse(content) as T;
}

export function getProjectInformationFromRawData(
  projectInformation: RawProjectInformation,
): ProjectInformation {
  const moduleIds = Object.keys(projectInformation);
  const modules = new Map<string, Module>();

  let rootModule: string | undefined;

  for (const [moduleId, rawModule] of Object.entries(projectInformation)) {
    if (rawModule.type === "root") {
      rootModule = moduleId;
    }

    const module: Module = {
      id: moduleId,
      name: rawModule.name,
      path: rawModule.path,
      type: rawModule.type,
      affectedModules: new Set(rawModule.affectedModules),
      version:
        rawModule.version === undefined
          ? createInitialVersion()
          : parseSemVer(rawModule.version),
      declaredVersion: rawModule.declaredVersion,
    };

    for (const [key, value] of Object.entries(rawModule)) {
      if (!(key in module)) {
        module[key] = value;
      }
    }

    modules.set(moduleId, module);
  }

  if (!rootModule) {
    throw new Error("No root module found. Project must include a root.");
  }

  return {
    moduleIds,
    modules,
    rootModule,
  };
}
