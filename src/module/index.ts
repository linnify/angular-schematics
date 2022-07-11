import {
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  Rule,
  Source,
  Tree,
  url
} from '@angular-devkit/schematics';
import {Schema} from './schema';

import {join, normalize, strings} from '@angular-devkit/core';
import {findModuleFromOptions} from '@schematics/angular/utility/find-module'

import {createDirectoryTemplateSource, setOptions} from '../utils/shared-utils';
import {linnifyModule} from './utils/generate-module.utils';
import {addPathToTsconfig} from '../utils/imports-utils';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function module(options: Schema): Rule {
  return async (tree: Tree) => {
    const project =  await setOptions(tree, options);

    if (options.module) {
      options.module = findModuleFromOptions(tree, options);
    }

    const modulePath = join(normalize(options.path), options.name);

    const isLazyLoadedModuleGen = !!(options.route && options.module);

    const templateSources = createTemplateSources(modulePath, options, isLazyLoadedModuleGen);

    if(isLazyLoadedModuleGen){
      templateSources.push(apply(url('./files/directories'), [
        applyTemplates({
          ...strings,
          name: 'containers',
          component: options.name,
          lazyRoute: true
        }),
        move(normalize(modulePath as string))
      ]))
    }

    return chain([
      linnifyModule(options, project),
      addPathToTsconfig(options, project),
      ...templateSources.map(templateSource => mergeWith(templateSource))
    ]);
  };
}

function createTemplateSources(modulePath: string, options: Schema, lazyLoadedModule): Source[] {
  const templateSources: Source[] = [];

  if (options.components) {
    templateSources.push(createDirectoryTemplateSource(modulePath, 'components'));
  }

  if (options.containers && !lazyLoadedModule) {
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

  if (options.types) {
    templateSources.push(apply(url('./files/_types'), [
      applyTemplates({}),
      move(normalize(modulePath as string))
    ]))
  }

  return templateSources;
}



