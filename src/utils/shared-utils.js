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
exports.parseModuleName = exports.createDirectoryTemplateSource = exports.generateComponentExternal = exports.generateFromFiles = exports.setOptions = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const core_1 = require("@angular-devkit/core");
const parse_name_1 = require("@schematics/angular/utility/parse-name");
const workspace_1 = require("@schematics/angular/utility/workspace");
function setOptions(host, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const workspace = yield workspace_1.getWorkspace(host);
        const project = workspace.projects.get(options.project);
        if (!project) {
            throw new schematics_1.SchematicsException(`Project "${options.project}" does not exist.`);
        }
        if (options.path === undefined) {
            options.path = workspace_1.buildDefaultPath(project);
        }
        const parsedPath = parse_name_1.parseName(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        return project;
    });
}
exports.setOptions = setOptions;
function generateFromFiles(options, extraTemplateValues = {}) {
    return () => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        (_a = options.prefix) !== null && _a !== void 0 ? _a : (options.prefix = '');
        (_b = options.flat) !== null && _b !== void 0 ? _b : (options.flat = true);
        const templateSource = schematics_1.apply(schematics_1.url('./files'), [
            options.skipTests ? schematics_1.filter((path) => !path.endsWith('.spec.ts.template')) : schematics_1.noop(),
            schematics_1.applyTemplates(Object.assign(Object.assign(Object.assign({}, core_1.strings), options), extraTemplateValues)),
            schematics_1.move(options.path + (options.flat ? '' : '/' + core_1.strings.dasherize(options.name))),
        ]);
        return schematics_1.chain([
            schematics_1.mergeWith(templateSource)
        ]);
    });
}
exports.generateFromFiles = generateFromFiles;
function generateComponentExternal(_options, schematic) {
    return schematics_1.externalSchematic('@schematics/angular', schematic, _options);
}
exports.generateComponentExternal = generateComponentExternal;
function createDirectoryTemplateSource(modulePath, directory) {
    return schematics_1.apply(schematics_1.url('../module/files/directories'), [
        schematics_1.applyTemplates({
            name: directory,
            lazyRoute: false
        }),
        schematics_1.move(core_1.normalize(modulePath))
    ]);
}
exports.createDirectoryTemplateSource = createDirectoryTemplateSource;
function parseModuleName(path, directory) {
    const paths = path.split('/');
    const directoryIndex = paths.findIndex(_path => _path === directory);
    // we will consider that the name of the module is found in the position before the directory
    if (directoryIndex <= 0) {
        return null;
    }
    return paths[directoryIndex - 1];
}
exports.parseModuleName = parseModuleName;
