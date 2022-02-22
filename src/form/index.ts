import {
  apply,
  applyTemplates,
  chain, FileOperator,
  filter, forEach, mergeWith, move,
  noop,
  Rule,
  SchematicsException,
  Tree,
  url
} from '@angular-devkit/schematics';
import {generateFromFiles, setOptions} from '../utils/shared-utils';
import {addDeclarationToIndexFile, findModuleFromOptions} from '../utils/imports-utils';

import {join, normalize, strings} from '@angular-devkit/core';
import {FormConfig} from './types/classes';
import {validateHtmlSelector, validateName} from '@schematics/angular/utility/validation';
import {Style} from '@schematics/angular/component/schema';

function buildSelector(options, projectPrefix) {
  let selector = strings.dasherize(options.name);
  if (options.prefix) {
    selector = `${options.prefix}-${selector}`;
  }
  else if (options.prefix === undefined && projectPrefix) {
    selector = `${projectPrefix}-${selector}`;
    options.prefix = projectPrefix;
  }
  return selector;
}

export function form(options: any): Rule {
  return async (host: Tree) => {
    const project = await setOptions(host, options);

    const configPath = normalize(join(options.path, options.config));

    const jsonFormConfig = host.read(configPath);

    if (!jsonFormConfig) {
      throw new SchematicsException(`File ${options.config} does not exist.`);
    }

    const jsonFormContent = jsonFormConfig.toString();

    const formJsonObj = new FormConfig(JSON.parse(jsonFormContent));

    const hasValidators = formJsonObj.controls.some(control => !!control.validators);

    options.module = findModuleFromOptions(host, options);
    options.name = options.name + '-form';
    options.selector =
      options.selector || buildSelector(options, (project && project.prefix) || '');
    validateName(options.name);
    validateHtmlSelector(options.selector);
    options.type = options.type != null ? options.type : 'Component';

    const skipStyleFile = options.inlineStyle || options.style === Style.None;

    const templateSource = apply(url('./files'), [
      options.skipTests ? filter((path) => !path.endsWith('.spec.ts.template')) : noop(),
      skipStyleFile ? filter((path) => !path.endsWith('.__style__.template')) : noop(),
      options.inlineTemplate ? filter((path) => !path.endsWith('.html.template')) : noop(),
      applyTemplates({
        ...strings,
        'if-flat': (s: string) => (options.flat ? '' : s),
        ...options,
        hasValidators,
        ...formJsonObj
      }),
      !options.type
        ? forEach(((file) => {
          return file.path.includes('..')
            ? {
              content: file.content,
              path: file.path.replace('..', '.'),
            }
            : file;
        }) as FileOperator)
        : noop(),
      move(options.path),
    ]);

    return chain([mergeWith(templateSource), addDeclarationToIndexFile(options)]);
  }
}