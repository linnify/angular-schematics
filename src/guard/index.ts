import {chain, Rule, Tree} from '@angular-devkit/schematics';
import {Schema} from './schema';
import {generateFromFiles, setOptions} from '../utils/shared-utils';
import {addDeclarationToIndexFile} from '../utils/imports-utils';

Object.defineProperty(exports, "__esModule", {value: true});
const schematics_1 = require("@angular-devkit/schematics");
const schema_1 = require("@schematics/angular/guard/schema");

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function guard(options: Schema): Rule {
  return async (host: Tree) => {
    if (!options.implements) {
      throw new schematics_1.SchematicsException('Option "implements" is required.');
    }
    const implementations = options.implements
      .map((implement) => (implement === 'CanDeactivate' ? 'CanDeactivate<unknown>' : implement))
      .join(', ');
    const commonRouterNameImports = ['ActivatedRouteSnapshot', 'RouterStateSnapshot'];
    const routerNamedImports = [...options.implements, 'UrlTree'];
    if (options.implements.includes(schema_1.Implement.CanLoad)) {
      routerNamedImports.push('Route', 'UrlSegment');
      if (options.implements.length > 1) {
        routerNamedImports.push(...commonRouterNameImports);
      }
    } else {
      routerNamedImports.push(...commonRouterNameImports);
    }
    routerNamedImports.sort();
    const implementationImports = routerNamedImports.join(', ');

    await setOptions(host, options);

    options.type = 'guard';

    console.log(implementations)

    return chain([
      generateFromFiles(options, {
        implementations,
        implementationImports,
      }),
      addDeclarationToIndexFile(options)
    ])
  }
}
