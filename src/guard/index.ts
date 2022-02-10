import {chain, Rule, Tree, SchematicsException} from '@angular-devkit/schematics';
import {Implement} from '@schematics/angular/guard/schema';
import {Schema} from './schema';
import {generateFromFiles, setOptions} from '../utils/shared-utils';
import {addDeclarationToIndexFile} from '../utils/imports-utils';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function guard(options: Schema): Rule {
  return async (host: Tree) => {
    if (!options.implements) {
      throw new SchematicsException('Option "implements" is required.');
    }
    const implementations = options.implements
      .map((implement) => (implement === 'CanDeactivate' ? 'CanDeactivate<unknown>' : implement))
      .join(', ');
    const commonRouterNameImports = ['ActivatedRouteSnapshot', 'RouterStateSnapshot'];
    const routerNamedImports = [...options.implements, 'UrlTree'];
    if (options.implements.includes(Implement.CanLoad)) {
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

    return chain([
      generateFromFiles(options, {
        implementations,
        implementationImports,
      }),
      addDeclarationToIndexFile(options)
    ])
  }
}
