import {apply, applyTemplates, externalSchematic, move, Rule, Source, Tree, url} from '@angular-devkit/schematics';
import {normalize} from '@angular-devkit/core';

const schematics_1 = require("@angular-devkit/schematics");
const parse_name_1 = require("@schematics/angular/utility/parse-name");
const workspace_1 = require("@schematics/angular/utility/workspace");
const core_1 = require("@angular-devkit/core");


export async function setOptions(host: Tree, options: any): Promise<any>{
  const workspace = await workspace_1.getWorkspace(host);
  const project = workspace.projects.get(options.project);
  if (!project) {
    throw new schematics_1.SchematicsException(`Project "${options.project}" does not exist.`);
  }
  if (options.path === undefined) {
    options.path = workspace_1.buildDefaultPath(project);
  }
  const parsedPath = parse_name_1.parseName(options.path, options.name);
  options.name = parsedPath.name;
  options.path = parsedPath.path;

  return project;
}

export function generateFromFiles(options, extraTemplateValues = {}) {
  return async () => {
    var _a, _b;
    (_a = options.prefix) !== null && _a !== void 0 ? _a : (options.prefix = '');
    (_b = options.flat) !== null && _b !== void 0 ? _b : (options.flat = true);

    const templateSource = schematics_1.apply(schematics_1.url('./files'), [
      options.skipTests ? schematics_1.filter((path) => !path.endsWith('.spec.ts.template')) : schematics_1.noop(),
      schematics_1.applyTemplates({
        ...core_1.strings,
        ...options,
        ...extraTemplateValues,
      }),
      schematics_1.move(options.path + (options.flat ? '' : '/' + core_1.strings.dasherize(options.name))),
    ]);
    return schematics_1.chain([
      schematics_1.mergeWith(templateSource)
    ]);
  };
}

export function generateComponentExternal(_options: any, schematic: string): Rule{
  return externalSchematic('@schematics/angular', schematic, _options);
}

export function createDirectoryTemplateSource(modulePath: string, directory: string): Source {
  return apply(url('../module/files/directories'), [
    applyTemplates({
      name: directory
    }),
    move(normalize(modulePath as string))
  ]);
}
