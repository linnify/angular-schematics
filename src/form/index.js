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
exports.form = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const shared_utils_1 = require("../utils/shared-utils");
const imports_utils_1 = require("../utils/imports-utils");
const core_1 = require("@angular-devkit/core");
const classes_1 = require("./types/classes");
const validation_1 = require("@schematics/angular/utility/validation");
const schema_1 = require("@schematics/angular/component/schema");
function buildSelector(options, projectPrefix) {
    let selector = core_1.strings.dasherize(options.name);
    if (options.prefix) {
        selector = `${options.prefix}-${selector}`;
    }
    else if (options.prefix === undefined && projectPrefix) {
        selector = `${projectPrefix}-${selector}`;
        options.prefix = projectPrefix;
    }
    return selector;
}
function form(options) {
    return (host) => __awaiter(this, void 0, void 0, function* () {
        const project = yield shared_utils_1.setOptions(host, options);
        const configPath = core_1.normalize(core_1.join(options.path, options.config));
        const jsonFormConfig = host.read(configPath);
        if (!jsonFormConfig) {
            throw new schematics_1.SchematicsException(`File ${options.config} does not exist.`);
        }
        const jsonFormContent = jsonFormConfig.toString();
        const formJsonObj = new classes_1.FormConfig(JSON.parse(jsonFormContent));
        const hasValidators = formJsonObj.controls.some(control => !!control.validators);
        options.module = imports_utils_1.findModuleFromOptions(host, options);
        options.name = options.name + '-form';
        options.selector =
            options.selector || buildSelector(options, (project && project.prefix) || '');
        validation_1.validateHtmlSelector(options.selector);
        options.type = options.type != null ? options.type : 'Component';
        const skipStyleFile = options.inlineStyle || options.style === schema_1.Style.None;
        const templateSource = schematics_1.apply(schematics_1.url('./files'), [
            options.skipTests ? schematics_1.filter((path) => !path.endsWith('.spec.ts.template')) : schematics_1.noop(),
            skipStyleFile ? schematics_1.filter((path) => !path.endsWith('.__style__.template')) : schematics_1.noop(),
            options.inlineTemplate ? schematics_1.filter((path) => !path.endsWith('.html.template')) : schematics_1.noop(),
            schematics_1.applyTemplates(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, core_1.strings), { 'if-flat': (s) => (options.flat ? '' : s) }), options), { hasValidators }), formJsonObj)),
            !options.type
                ? schematics_1.forEach(((file) => {
                    return file.path.includes('..')
                        ? {
                            content: file.content,
                            path: file.path.replace('..', '.'),
                        }
                        : file;
                }))
                : schematics_1.noop(),
            schematics_1.move(options.path),
        ]);
        return schematics_1.chain([schematics_1.mergeWith(templateSource), imports_utils_1.addDeclarationToIndexFile(options)]);
    });
}
exports.form = form;
