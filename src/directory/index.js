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
exports.directory = void 0;
const schematics_2 = require("@angular-devkit/schematics");
const shared_utils_1 = require("../utils/shared-utils");
const imports_utils_1 = require("../utils/imports-utils");
const core_1 = require("@angular-devkit/core");
const workspace_1 = require("@schematics/angular/utility/workspace");
const find_module_1 = require("@schematics/angular/utility/find-module");
const schematics_1 = require("@angular-devkit/schematics");
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
function directory(options) {
    return (host, _context) => __awaiter(this, void 0, void 0, function* () {
        const workspace = yield workspace_1.getWorkspace(host);
        const project = workspace.projects.get(options.project);
        if (!project) {
            throw new schematics_1.SchematicsException(`Project "${options.project}" does not exist.`);
        }
        if (options.path === undefined) {
            options.path = workspace_1.buildDefaultPath(project);
        }
        options.module = find_module_1.findModuleFromOptions(host, options);
        let templateSource;
        if (options.name === "types") {
            templateSource = schematics_2.apply(schematics_2.url('../module/files/_types'), [
                schematics_2.applyTemplates({}),
                schematics_2.move(core_1.normalize(options.path))
            ]);
            return schematics_2.chain([
                schematics_2.mergeWith(templateSource)
            ]);
        }
        templateSource = shared_utils_1.createDirectoryTemplateSource(options.path, options.name);
        return schematics_2.chain([
            schematics_2.mergeWith(templateSource),
            imports_utils_1.addDeclarationToModuleFile(options)
        ]);
    });
}
exports.directory = directory;
