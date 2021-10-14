import {chain, Rule, Tree} from '@angular-devkit/schematics';
import {Schema} from './schema';
import {addDeclarationToIndexFile} from '../utils/imports-utils';
import {generateFromFiles, setOptions} from '../utils/shared-utils';


export function service(options: Schema): Rule {
  return async (host: Tree) => {
    await setOptions(host, options);

    options.type = 'service';

    const flat = options.flat;
    options.flat = true;

    return chain([
      generateFromFiles(options, {
        'if-flat': (s) => (flat ? '' : s),
      }),
      addDeclarationToIndexFile(options)
    ]);
  };
}
