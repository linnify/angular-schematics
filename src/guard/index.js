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
exports.guard = void 0;
const schematics_2 = require("@angular-devkit/schematics");
const shared_utils_1 = require("../utils/shared-utils");
const imports_utils_1 = require("../utils/imports-utils");
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const schema_1 = require("@schematics/angular/guard/schema");
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
function guard(options) {
    return (host) => __awaiter(this, void 0, void 0, function* () {
        if (!options.implements) {
            throw new schematics_1.SchematicsException('Option "implements" is required.');
        }
        const implementations = options.implements
            .map((implement) => (implement === 'CanDeactivate' ? 'CanDeactivate<unknown>' : implement))
            .join(', ');
        const commonRouterNameImports = ['ActivatedRouteSnapshot', 'RouterStateSnapshot'];
        const routerNamedImports = [...options.implements, 'UrlTree'];
        if (options.implements.includes(schema_1.Implement.CanLoad)) {
            routerNamedImports.push('Route', 'UrlSegment');
            if (options.implements.length > 1) {
                routerNamedImports.push(...commonRouterNameImports);
            }
        }
        else {
            routerNamedImports.push(...commonRouterNameImports);
        }
        routerNamedImports.sort();
        const implementationImports = routerNamedImports.join(', ');
        yield shared_utils_1.setOptions(host, options);
        options.type = 'guard';
        return schematics_2.chain([
            shared_utils_1.generateFromFiles(options, {
                implementations,
                implementationImports,
            }),
            imports_utils_1.addDeclarationToIndexFile(options)
        ]);
    });
}
exports.guard = guard;
