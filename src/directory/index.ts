import {
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  Tree,
  url
} from '@angular-devkit/schematics';
import {createDirectoryTemplateSource} from '../utils/shared-utils';
import {Schema} from './schema';
import {addDeclarationToModuleFile} from '../utils/imports-utils';
import {normalize} from '@angular-devkit/core';

const workspace_1 = require("@schematics/angular/utility/workspace");
const find_module_1 = require("@schematics/angular/utility/find-module");
const schematics_1 = require("@angular-devkit/schematics");

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function directory(options: Schema): Rule {
  return async (host: Tree, _context: SchematicContext) => {
    const workspace = await workspace_1.getWorkspace(host);
    const project = workspace.projects.get(options.project);
    if (!project) {
      throw new schematics_1.SchematicsException(`Project "${options.project}" does not exist.`);
    }
    if (options.path === undefined) {
      options.path = workspace_1.buildDefaultPath(project);
    }
    options.module = find_module_1.findModuleFromOptions(host, options);

    let templateSource;

    if(options.name === "types"){
      templateSource = apply(url('../module/files/_types'), [
        applyTemplates({}),
        move(normalize(options.path as string))
      ]);
      return chain([
        mergeWith(templateSource)
      ]);
    }

    templateSource = createDirectoryTemplateSource(options.path, options.name);

    return chain([
      mergeWith(templateSource),
      addDeclarationToModuleFile(options)
    ]);
  };
}
