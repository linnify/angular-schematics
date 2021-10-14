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
exports.component = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const imports_utils_1 = require("../utils/imports-utils");
const shared_utils_1 = require("../utils/shared-utils");
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
function generateComponentExternal(_options) {
    return schematics_1.externalSchematic('@schematics/angular', 'component', _options);
}
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
function component(options) {
    return (host) => __awaiter(this, void 0, void 0, function* () {
        const project = yield shared_utils_1.setOptions(host, options);
        options.selector =
            options.selector || buildSelector(options, (project && project.prefix) || '');
        validation_1.validateName(options.name);
        validation_1.validateHtmlSelector(options.selector);
        options.type = options.type != null ? options.type : 'Component';
        return schematics_1.chain([
            generateComponentExternal(options),
            imports_utils_1.addDeclarationToIndexFile(options)
        ]);
    });
}
exports.component = component;
