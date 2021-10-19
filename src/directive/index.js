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
exports.directive = void 0;
const schematics_1 = require("@angular-devkit/schematics");
const shared_utils_1 = require("../utils/shared-utils");
const imports_utils_1 = require("../utils/imports-utils");
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
function directive(options) {
    return (host, _context) => __awaiter(this, void 0, void 0, function* () {
        yield shared_utils_1.setOptions(host, options);
        options.type = 'directive';
        const directiveOptions = Object.assign({}, options);
        delete directiveOptions.skipIndexImport;
        delete directiveOptions.indexExport;
        delete directiveOptions.type;
        return schematics_1.chain([
            shared_utils_1.generateComponentExternal(directiveOptions, 'directive'),
            imports_utils_1.addDeclarationToIndexFile(options)
        ]);
    });
}
exports.directive = directive;
