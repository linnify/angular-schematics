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
exports.service = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const imports_utils_1 = require("../utils/imports-utils");
const shared_utils_1 = require("../utils/shared-utils");
const core_1 = require("@angular-devkit/core");
function service(options) {
    return (host) => __awaiter(this, void 0, void 0, function* () {
        const project = yield shared_utils_1.setOptions(host, options);
        options.type = 'service';
        const flat = options.flat;
        options.flat = true;
        options.project = project;
        const module = shared_utils_1.parseModuleName(options.path, 'services');
        const repoPath = core_1.normalize(options.path.replace('services', 'repositories'));
        const modulePath = core_1.normalize(options.path.replace('services', ''));
        const repoOptions = {
            module,
            flat: options.flat,
            name: options.name,
            skipImport: true,
            path: repoPath
        };
        let hasRepoDirectory = true;
        let repoDirectoryOptions;
        const indexPath = core_1.join(core_1.normalize(repoPath), 'index.ts');
        const text = host.read(indexPath);
        if (text === null) {
            hasRepoDirectory = false;
            repoDirectoryOptions = {
                name: 'repositories',
                module,
                path: modulePath
            };
        }
        return schematics_1.chain([schematics_1.chain([
                shared_utils_1.generateFromFiles(options, Object.assign(Object.assign({}, core_1.strings), { 'if-flat': (s) => (flat ? '' : s), repo: !!options.repo, appPrefix: project.prefix, module })),
                imports_utils_1.addDeclarationToIndexFile(options),
                !hasRepoDirectory ? schematics_1.schematic('l-dir', repoDirectoryOptions) : schematics_1.noop()
            ]), options.repo ? schematics_1.schematic('repo', repoOptions) : schematics_1.noop()]);
    });
}
exports.service = service;
