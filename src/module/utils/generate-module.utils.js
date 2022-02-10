"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linnifyModule = void 0;
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// @ts-ignore
const ts = require("@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript");
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const change_1 = require("@schematics/angular/utility/change");
const find_module_1 = require("@schematics/angular//utility/find-module");
const parse_name_1 = require("@schematics/angular/utility/parse-name");
const schema_1 = require("@schematics/angular/module/schema");
const shared_utils_1 = require("../../utils/shared-utils");
function buildAbsoluteModulePath(options, projectPrefix) {
    const importModulePath = (options.flat ? '' : core_1.strings.dasherize(options.name) + '/') +
        core_1.strings.dasherize(options.name) +
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
            throw new schematics_1.SchematicsException(`File ${modulePath} does not exist.`);
        }
        const sourceText = text.toString();
        const source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
        const absolutePath = buildAbsoluteModulePath(options, projectPrefix);
        const changes = ast_utils_1.addImportToModule(source, modulePath, core_1.strings.classify(`${options.name}Module`), absolutePath);
        const recorder = host.beginUpdate(modulePath);
        for (const change of changes) {
            if (change instanceof change_1.InsertChange) {
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
        }
        else {
            path = options.module;
        }
        const text = host.read(path);
        if (!text) {
            throw new Error(`Couldn't find the module nor its routing module.`);
        }
        const sourceText = text.toString();
        const addDeclaration = ast_utils_1.addRouteDeclarationToModule(ts.createSourceFile(path, sourceText, ts.ScriptTarget.Latest, true), path, buildRoute(options, projectPrefix));
        const recorder = host.beginUpdate(path);
        recorder.insertLeft(addDeclaration.pos, addDeclaration.toAdd);
        host.commitUpdate(recorder);
        return host;
    };
}
function getRoutingModulePath(host, modulePath) {
    const routingModulePath = modulePath.endsWith(find_module_1.ROUTING_MODULE_EXT)
        ? modulePath
        : modulePath.replace(find_module_1.MODULE_EXT, find_module_1.ROUTING_MODULE_EXT);
    return host.exists(routingModulePath) ? core_1.normalize(routingModulePath) : undefined;
}
function buildRoute(options, projectPrefix) {
    const absoluteModulePath = buildAbsoluteModulePath(options, projectPrefix);
    const moduleName = `${core_1.strings.classify(options.name)}Module`;
    const loadChildren = `() => import('${absoluteModulePath}').then(m => m.${moduleName})`;
    return `{ path: '${options.route}', loadChildren: ${loadChildren} }`;
}
function linnifyModule(options, project) {
    return (host) => __awaiter(this, void 0, void 0, function* () {
        let routingModulePath;
        const isLazyLoadedModuleGen = !!(options.route && options.module);
        if (isLazyLoadedModuleGen) {
            options.routingScope = schema_1.RoutingScope.Child;
            routingModulePath = getRoutingModulePath(host, options.module);
        }
        const parsedPath = parse_name_1.parseName(options.path, options.name);
        const templateSource = schematics_1.apply(schematics_1.url('./files/module'), [
            options.routing || (isLazyLoadedModuleGen && routingModulePath)
                ? schematics_1.noop()
                : schematics_1.filter((path) => !path.endsWith('-routing.module.ts.template')),
            schematics_1.applyTemplates(Object.assign(Object.assign(Object.assign({}, core_1.strings), { 'if-flat': (s) => (options.flat ? '' : s), lazyRoute: isLazyLoadedModuleGen, lazyRouteWithoutRouteModule: isLazyLoadedModuleGen && !routingModulePath, lazyRouteWithRouteModule: isLazyLoadedModuleGen && !!routingModulePath }), options)),
            schematics_1.move(parsedPath.path),
        ]);
        const moduleDasherized = core_1.strings.dasherize(options.name);
        const componentModulePath = `${!options.flat ? moduleDasherized + '/' : ''}${moduleDasherized}.module.ts`;
        const componentOptions = {
            module: componentModulePath,
            flat: options.flat,
            name: options.name + '/containers/' + options.name,
            path: options.path,
            project: options.project,
            skipImport: true
        };
        return schematics_1.chain([
            !isLazyLoadedModuleGen ? addDeclarationToNgModule(options, project.prefix) : schematics_1.noop(),
            addRouteDeclarationToNgModule(options, routingModulePath, project.prefix),
            schematics_1.mergeWith(templateSource),
            isLazyLoadedModuleGen ? shared_utils_1.generateComponentExternal(componentOptions, 'component') : schematics_1.noop()
        ]);
    });
}
exports.linnifyModule = linnifyModule;
