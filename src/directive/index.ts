import {chain, Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {generateComponentExternal, setOptions} from '../utils/shared-utils';
import {addDeclarationToIndexFile} from '../utils/imports-utils';
import {Schema} from './schema';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function directive(options: Schema): Rule {
  return async (host: Tree, _context: SchematicContext) => {
    await setOptions(host, options);

    options.type = 'directive';

    return chain([
      generateComponentExternal(options, 'directive'),
      addDeclarationToIndexFile(options)
    ]);
  };
}
