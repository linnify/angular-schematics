"use strict";

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// @ts-ignore
import * as ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import {normalize, strings} from "@angular-devkit/core"
import {
  SchematicsException,
  apply,
  applyTemplates,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  url
} from '@angular-devkit/schematics';
import {addImportToModule, addRouteDeclarationToModule} from '@schematics/angular/utility/ast-utils';
import {InsertChange} from '@schematics/angular/utility/change';
import {
  MODULE_EXT,
  ROUTING_MODULE_EXT
} from '@schematics/angular//utility/find-module';
import {parseName} from '@schematics/angular/utility/parse-name'
import {RoutingScope} from '@schematics/angular/module/schema'
import {generateComponentExternal} from '../../utils/shared-utils';

function buildAbsoluteModulePath(options, projectPrefix) {
  const importModulePath = (options.flat ? '' : strings.dasherize(options.name) + '/') +
    strings.dasherize(options.name) +
    '.module';
  return '@' + projectPrefix + '/' + importModulePath;
}

function addDeclarationToNgModule(options, projectPrefix) {

  return (host) => {
    if (!options.module) {
      return host;
    }
    const modulePath = options.module;
    const text = host.read(modulePath);
    if (text === null) {
      throw new SchematicsException(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString();
    const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
    const absolutePath = buildAbsoluteModulePath(options, projectPrefix);
    const changes = addImportToModule(source, modulePath, strings.classify(`${options.name}Module`), absolutePath);
    const recorder = host.beginUpdate(modulePath);
    for (const change of changes) {
      if (change instanceof InsertChange) {
        recorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(recorder);
    return host;
  };
}

function addRouteDeclarationToNgModule(options, routingModulePath, projectPrefix) {
  return (host) => {
    if (!options.route) {
      return host;
    }
    if (!options.module) {
      throw new Error('Module option required when creating a lazy loaded routing module.');
    }
    let path;
    if (routingModulePath) {
      path = routingModulePath;
    } else {
      path = options.module;
    }
    const text = host.read(path);
    if (!text) {
      throw new Error(`Couldn't find the module nor its routing module.`);
    }
    const sourceText = text.toString();
    const addDeclaration = addRouteDeclarationToModule(
      ts.createSourceFile(path, sourceText, ts.ScriptTarget.Latest, true),
      path,
      buildRoute(options, projectPrefix)
    ) as InsertChange;
    const recorder = host.beginUpdate(path);
    recorder.insertLeft(addDeclaration.pos, addDeclaration.toAdd);
    host.commitUpdate(recorder);
    return host;
  };
}

function getRoutingModulePath(host, modulePath) {
  const routingModulePath = modulePath.endsWith(ROUTING_MODULE_EXT)
    ? modulePath
    : modulePath.replace(MODULE_EXT, ROUTING_MODULE_EXT);
  return host.exists(routingModulePath) ? normalize(routingModulePath) : undefined;
}

function buildRoute(options, projectPrefix) {
  const absoluteModulePath = buildAbsoluteModulePath(options, projectPrefix);
  const moduleName = `${strings.classify(options.name)}Module`;
  const loadChildren = `() => import('${absoluteModulePath}').then(m => m.${moduleName})`;
  return `{ path: '${options.route}', loadChildren: ${loadChildren} }`;
}

export function linnifyModule(options, project) {
  return async (host) => {
    let routingModulePath;

    const isLazyLoadedModuleGen = !!(options.route && options.module);
    if (isLazyLoadedModuleGen) {
      options.routingScope = RoutingScope.Child;
      routingModulePath = getRoutingModulePath(host, options.module);
    }
    const parsedPath = parseName(options.path, options.name);
    const templateSource = apply(url('./files/module'), [
      options.routing || (isLazyLoadedModuleGen && routingModulePath)
        ? noop()
        : filter((path) => !path.endsWith('-routing.module.ts.template')),
      applyTemplates({
        ...strings,
        'if-flat': (s) => (options.flat ? '' : s),
        lazyRoute: isLazyLoadedModuleGen,
        lazyRouteWithoutRouteModule: isLazyLoadedModuleGen && !routingModulePath,
        lazyRouteWithRouteModule: isLazyLoadedModuleGen && !!routingModulePath,
        ...options,
      }),
      move(parsedPath.path),
    ]);

    const moduleDasherized = strings.dasherize(options.name);
    const componentModulePath = `${!options.flat ? moduleDasherized + '/' : ''}${moduleDasherized}.module.ts`;
    const componentOptions = {
      module: componentModulePath,
      flat: options.flat,
      name: options.name + '/containers/' + options.name,
      path: options.path,
      project: options.project,
      skipImport: true
    };

    return chain([
      !isLazyLoadedModuleGen ? addDeclarationToNgModule(options, project.prefix) : noop(),
      addRouteDeclarationToNgModule(options, routingModulePath, project.prefix),
      mergeWith(templateSource),
      isLazyLoadedModuleGen ? generateComponentExternal(componentOptions, 'component') : noop()
    ]);
  };
}
