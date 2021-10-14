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
const schematics_1 = require("@angular-devkit/schematics");
const testing_1 = require("@angular-devkit/schematics/testing");
const schema_1 = require("@schematics/angular/application/schema");
const workspaceOptions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '10.0.0'
};
const appOptions = {
    name: 'bar',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: schema_1.Style.Css,
    skipTests: false,
    skipPackageJson: false
};
const defaultOptions = {
    name: 'foo',
    flat: false,
    project: 'bar',
    module: undefined,
};
const runner = new testing_1.SchematicTestRunner('schematics', require.resolve('../collection.json'));
let appTree;
describe('linnify-schematics', () => {
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        appTree = yield runner.runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions).toPromise();
        appTree = yield runner.runExternalSchematicAsync('@schematics/angular', 'application', appOptions, appTree).toPromise();
    }));
    it('should create a module file', () => __awaiter(void 0, void 0, void 0, function* () {
        const tree = yield runner
            .runSchematicAsync('linnify-module', defaultOptions, schematics_1.Tree.empty())
            .toPromise();
        expect(tree.files.includes('/projects/bar/src/app/foo/foo.module.ts'));
    }));
});
