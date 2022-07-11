import {
  apply,
  applyTemplates,
  externalSchematic,
  move,
  Rule,
  Source,
  Tree,
  url,
  SchematicsException,
  filter,
  noop,
  chain,
  mergeWith
} from '@angular-devkit/schematics';
import {normalize, strings} from '@angular-devkit/core';
import {parseName} from '@schematics/angular/utility/parse-name';
import {buildDefaultPath, getWorkspace} from '@schematics/angular/utility/workspace'

export async function setOptions(host: Tree, options: any): Promise<any> {
  const workspace = await getWorkspace(host);
  const project = workspace.projects.get(options.project);
  if (!project) {
    throw new SchematicsException(`Project "${options.project}" does not exist.`);
  }
  if (options.path === undefined) {
    options.path = buildDefaultPath(project);
  }
  const parsedPath = parseName(options.path, options.name);
  options.name = parsedPath.name;
  options.path = parsedPath.path;

  return project;
}

export function generateFromFiles(options, extraTemplateValues = {}) {
  return async () => {
    var _a, _b;
    (_a = options.prefix) !== null && _a !== void 0 ? _a : (options.prefix = '');
    (_b = options.flat) !== null && _b !== void 0 ? _b : (options.flat = true);

    const templateSource = apply(url('./files'), [
      options.skipTests ? filter((path) => !path.endsWith('.spec.ts.template')) : noop(),
      applyTemplates({
        ...strings,
        ...options,
        ...extraTemplateValues,
      }),
      move(options.path + (options.flat ? '' : '/' + strings.dasherize(options.name))),
    ]);
    return chain([
      mergeWith(templateSource)
    ]);
  };
}

export function generateComponentExternal(_options: any, schematic: string): Rule {
  return externalSchematic('@schematics/angular', schematic, _options);
}

export function createDirectoryTemplateSource(modulePath: string, directory: string): Source {
  return apply(url('../module/files/directories'), [
    applyTemplates({
      name: directory,
      lazyRoute: false
    }),
    move(normalize(modulePath as string))
  ]);
}

export function parseModuleName(path: string, directory: string): string {
  const paths = path.split('/');
  const directoryIndex = paths.findIndex(_path => _path === directory);
  // we will consider that the name of the module is found in the position before the directory
  if (directoryIndex <= 0) {
    return null;
  }
  return paths[directoryIndex - 1];
}
