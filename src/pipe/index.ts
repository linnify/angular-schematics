import {chain, Rule, SchematicContext, Tree} from '@angular-devkit/schematics';
import {generateComponentExternal, setOptions} from '../utils/shared-utils';
import {addDeclarationToIndexFile} from '../utils/imports-utils';
import {Schema} from './schema';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function pipe(options: Schema): Rule {
  return async (host: Tree, _context: SchematicContext) => {
    await setOptions(host, options);

    options.type = 'pipe';

    const pipeOptions = Object.assign({}, options);
    delete pipeOptions.skipIndexImport;
    delete pipeOptions.indexExport;
    delete pipeOptions.type;

    return chain([
      generateComponentExternal(pipeOptions, 'pipe'),
      addDeclarationToIndexFile(options)
    ]);
  };
}
