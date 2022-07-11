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
import {createDirectoryTemplateSource, setOptions} from '../utils/shared-utils';
import {Schema} from './schema';
import {addDeclarationToModuleFile} from '../utils/imports-utils';
import {normalize} from '@angular-devkit/core';

import {findModuleFromOptions} from '@schematics/angular/utility/find-module';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function directory(options: Schema): Rule {
  return async (host: Tree, _context: SchematicContext) => {
    await setOptions(host, options);
    options.module = findModuleFromOptions(host, options);

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
