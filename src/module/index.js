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
exports.module = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const core_1 = require("@angular-devkit/core");
const find_module_1 = require("@schematics/angular/utility/find-module");
const shared_utils_1 = require("../utils/shared-utils");
const generate_module_utils_1 = require("./utils/generate-module.utils");
const imports_utils_1 = require("../utils/imports-utils");
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
function module(options) {
    return (tree) => __awaiter(this, void 0, void 0, function* () {
        const project = yield shared_utils_1.setOptions(tree, options);
        if (options.module) {
            options.module = find_module_1.findModuleFromOptions(tree, options);
        }
        const modulePath = core_1.join(core_1.normalize(options.path), options.name);
        const isLazyLoadedModuleGen = !!(options.route && options.module);
        const templateSources = createTemplateSources(modulePath, options, isLazyLoadedModuleGen);
        if (isLazyLoadedModuleGen) {
            templateSources.push(schematics_1.apply(schematics_1.url('./files/directories'), [
                schematics_1.applyTemplates(Object.assign(Object.assign({}, core_1.strings), { name: 'containers', component: options.name, lazyRoute: true })),
                schematics_1.move(core_1.normalize(modulePath))
            ]));
        }
        return schematics_1.chain([
            generate_module_utils_1.linnifyModule(options, project),
            imports_utils_1.addPathToTsconfig(options, project),
            ...templateSources.map(templateSource => schematics_1.mergeWith(templateSource))
        ]);
    });
}
exports.module = module;
function createTemplateSources(modulePath, options, lazyLoadedModule) {
    const templateSources = [];
    if (options.components) {
        templateSources.push(shared_utils_1.createDirectoryTemplateSource(modulePath, 'components'));
    }
    if (options.containers && !lazyLoadedModule) {
        templateSources.push(shared_utils_1.createDirectoryTemplateSource(modulePath, 'containers'));
    }
    if (options.directives) {
        templateSources.push(shared_utils_1.createDirectoryTemplateSource(modulePath, 'directives'));
    }
    if (options.guards) {
        templateSources.push(shared_utils_1.createDirectoryTemplateSource(modulePath, 'guards'));
    }
    if (options.pipes) {
        templateSources.push(shared_utils_1.createDirectoryTemplateSource(modulePath, 'pipes'));
    }
    if (options.services) {
        templateSources.push(shared_utils_1.createDirectoryTemplateSource(modulePath, 'services'));
    }
    if (options.repositories) {
        templateSources.push(shared_utils_1.createDirectoryTemplateSource(modulePath, 'repositories'));
    }
    if (options.types) {
        templateSources.push(schematics_1.apply(schematics_1.url('./files/_types'), [
            schematics_1.applyTemplates({}),
            schematics_1.move(core_1.normalize(modulePath))
        ]));
    }
    return templateSources;
}
