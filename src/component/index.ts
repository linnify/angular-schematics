import {chain, Rule, Tree} from '@angular-devkit/schematics';
import {Schema} from './schema';
import {addDeclarationToIndexFile} from '../utils/imports-utils';

import {generateComponentExternal, setOptions} from '../utils/shared-utils';

const core_1 = require("@angular-devkit/core");
const validation_1 = require("@schematics/angular/utility/validation");

function buildSelector(options, projectPrefix) {
  let selector = core_1.strings.dasherize(options.name);
  if (options.prefix) {
    selector = `${options.prefix}-${selector}`;
  }
  else if (options.prefix === undefined && projectPrefix) {
    selector = `${projectPrefix}-${selector}`;
  }
  return selector;
}

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function component(options: any): Rule {
  return async (host: Tree) => {
    const project = await setOptions(host, options);
    options.selector =
      options.selector || buildSelector(options, (project && project.prefix) || '');
    validation_1.validateName(options.name);
    validation_1.validateHtmlSelector(options.selector);
    options.type = options.type != null ? options.type : 'Component';

    const componentOptions = Object.assign({}, options);
    delete componentOptions.skipIndexImport;
    delete componentOptions.indexExport;

    return chain([
      generateComponentExternal(componentOptions, 'component'),
      addDeclarationToIndexFile(options)
    ]);
  };
}
