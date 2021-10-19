import {apply, applyTemplates, chain, mergeWith, move, Rule, Source, Tree, url} from '@angular-devkit/schematics';
import {Schema} from './schema';

import {join, normalize} from '@angular-devkit/core';

import {linnifyModule} from './utils/generate-module.utils';

import {parseName} from '@schematics/angular/utility/parse-name';
import {createDirectoryTemplateSource} from '../utils/shared-utils';
const workspace_1 = require("@schematics/angular/utility/workspace");
const find_module_1 = require("@schematics/angular/utility/find-module");

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function module(options: Schema): Rule {
  return async (tree: Tree) => {
    if (options.path === undefined) {
      options.path = await workspace_1.createDefaultPath(tree, options.project);
    }
    if (options.module) {
      options.module = find_module_1.findModuleFromOptions(tree, options);
    }

    const parsedPath = parseName(options.path as string, options.name);
    options.name = parsedPath.name;
    options.path = parsedPath.path;

    const modulePath = join(normalize(options.path), options.name);

    const templateSources = createTemplateSources(modulePath, options);

    return chain([
      linnifyModule(options),
      ...templateSources.map(templateSource => mergeWith(templateSource))
    ]);
  };
}

function createTemplateSources(modulePath: string, options: Schema): Source[] {
  const templateSources: Source[] = [];

  if (options.components) {
    templateSources.push(createDirectoryTemplateSource(modulePath, 'components'));
  }

  if (options.containers) {
    templateSources.push(createDirectoryTemplateSource(modulePath, 'containers'));
  }

  if (options.directives) {
    templateSources.push(createDirectoryTemplateSource(modulePath, 'directives'));
  }

  if (options.guards) {
    templateSources.push(createDirectoryTemplateSource(modulePath, 'guards'));
  }

  if (options.pipes) {
    templateSources.push(createDirectoryTemplateSource(modulePath, 'pipes'));
  }

  if (options.services) {
    templateSources.push(createDirectoryTemplateSource(modulePath, 'services'));
  }

  if (options.repositories) {
    templateSources.push(createDirectoryTemplateSource(modulePath, 'repositories'));
  }

  if(options.types){
    templateSources.push(apply(url('./files/_types'), [
      applyTemplates({}),
      move(normalize(modulePath as string))
    ]))
  }

  return templateSources;
}



