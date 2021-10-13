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
const generate_module_utils_1 = require("./utils/generate-module.utils");
const parse_name_1 = require("@schematics/angular/utility/parse-name");
const workspace_1 = require("@schematics/angular/utility/workspace");
const find_module_1 = require("@schematics/angular/utility/find-module");
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
function module(options) {
    return (tree) => __awaiter(this, void 0, void 0, function* () {
        if (options.path === undefined) {
            options.path = yield workspace_1.createDefaultPath(tree, options.project);
        }
        if (options.module) {
            options.module = find_module_1.findModuleFromOptions(tree, options);
        }
        const parsedPath = parse_name_1.parseName(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        const modulePath = core_1.join(core_1.normalize(options.path), options.name);
        const templateSources = createTemplateSources(modulePath, options);
        return schematics_1.chain([
            generate_module_utils_1.linnifyModule(options),
            ...templateSources.map(templateSource => schematics_1.mergeWith(templateSource))
        ]);
    });
}
exports.module = module;
function createTemplateSources(modulePath, options) {
    const templateSources = [];
    if (options.components) {
        templateSources.push(createTemplateSource(modulePath, 'components'));
    }
    if (options.containers) {
        templateSources.push(createTemplateSource(modulePath, 'containers'));
    }
    if (options.directives) {
        templateSources.push(createTemplateSource(modulePath, 'directives'));
    }
    if (options.guards) {
        templateSources.push(createTemplateSource(modulePath, 'guards'));
    }
    if (options.pipes) {
        templateSources.push(createTemplateSource(modulePath, 'pipes'));
    }
    if (options.services) {
        templateSources.push(createTemplateSource(modulePath, 'services'));
    }
    if (options.types) {
        templateSources.push(schematics_1.apply(schematics_1.url('./files/_types'), [
            schematics_1.applyTemplates({}),
            schematics_1.move(core_1.normalize(modulePath))
        ]));
    }
    return templateSources;
}
function createTemplateSource(modulePath, directory) {
    return schematics_1.apply(schematics_1.url('./files/directories'), [
        schematics_1.applyTemplates({
            name: directory
        }),
        schematics_1.move(core_1.normalize(modulePath))
    ]);
}
//# sourceMappingURL=index.js.map