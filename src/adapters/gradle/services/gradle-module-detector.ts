import { ModuleDetector } from "../../../services/module-detector.js";
import { ModuleRegistry } from '../../../services/module-registry.js';
import { 
  getRawProjectInformation,
  getProjectInformation 
} from '../gradle-project-information.js';

export class GradleModuleDetector implements ModuleDetector {
  constructor(readonly repoRoot: string) {}

  async detect(): Promise<ModuleRegistry> {
    const rawProjectInformation = await getRawProjectInformation(this.repoRoot);
    const projectInformation = getProjectInformation(rawProjectInformation);
    return new ModuleRegistry(projectInformation);
  }
}
