"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPathToTsconfig = exports.addDeclarationToModuleFile = exports.addClassExportToIndexFile = exports.addDeclarationToIndexFile = exports.findModuleFromOptions = exports.readIntoSourceFile = void 0;
// @ts-ignore
const ts = require("@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript");
const change_1 = require("@schematics/angular/utility/change");
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const find_module_1 = require("@schematics/angular/utility/find-module");
function addSymbolToIndexMetadata(source, indexPath, symbolName, importPath = null) {
    const nodes = ast_utils_1.getSourceNodes(source)
        .filter((node) => node.kind === ts.SyntaxKind.ArrayLiteralExpression);
    // should be only one array in the index file
    if (!nodes || nodes.length !== 1) {
        return [];
    }
    // @ts-ignore
    let node = nodes[0].elements;
    if (Array.isArray(node)) {
        const nodeArray = node;
        const symbolsArray = nodeArray.map((node) => core_1.tags.oneLine `${node.getText()}`);
        if (symbolsArray.includes(core_1.tags.oneLine `${symbolName}`)) {
            return [];
        }
        if (node.length !== 0) {
            node = node[node.length - 1];
        }
    }
    let toInsert;
    let position = node.end;
    if (!node.kind) {
        // We found the field but it's empty. Insert it just before the `]`.
        toInsert = `\n${core_1.tags.indentBy(2) `${symbolName}`}\n`;
    }
    else {
        // Get the indentation of the last element, if any.
        const text = node.getFullText(source);
        const matches = text.match(/^(\r?\n)(\s*)/);
        if (matches) {
            toInsert = `,${matches[1]}${core_1.tags.indentBy(matches[2].length) `${symbolName}`}`;
        }
        else {
            toInsert = `, ${symbolName}`;
        }
    }
    if (importPath !== null) {
        return [
            new change_1.InsertChange(indexPath, position, toInsert),
            ast_utils_1.insertImport(source, indexPath, symbolName.replace(/\..*$/, ''), importPath)
        ];
    }
    return [new change_1.InsertChange(indexPath, position, toInsert)];
}
function nodesByPosition(first, second) {
    return first.getStart() - second.getStart();
}
function insertAfterLastOccurrence(nodes, toInsert, file, fallbackPos, syntaxKind) {
    let lastItem;
    for (const node of nodes) {
        if (!lastItem || lastItem.getStart() < node.getStart()) {
            lastItem = node;
        }
    }
    if (syntaxKind && lastItem) {
        lastItem = ast_utils_1.findNodes(lastItem, syntaxKind).sort(nodesByPosition).pop();
    }
    if (!lastItem && fallbackPos == undefined) {
        throw new Error(`tried to insert ${toInsert} as first occurence with no fallback position`);
    }
    const lastItemPosition = lastItem ? lastItem.getEnd() + 2 : fallbackPos;
    return new change_1.InsertChange(file, lastItemPosition, toInsert);
}
function addExportToIndex(source, indexPath, symbolName, importPath = null) {
    if (importPath === null) {
        return [];
    }
    const rootNode = source;
    const allExports = ast_utils_1.findNodes(rootNode, ts.SyntaxKind.ExportDeclaration);
    const toExport = `export * from '${importPath}';\n`;
    const fallbackPos = rootNode.end;
    return [
        insertAfterLastOccurrence(allExports, toExport, indexPath, fallbackPos, ts.SyntaxKind.StringLiteral)
    ];
}
function readIntoSourceFile(host, modulePath) {
    const text = host.read(modulePath);
    if (text === null) {
        throw new schematics_1.SchematicsException(`File ${modulePath} does not exist.`);
    }
    const sourceText = text.toString('utf-8');
    return ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
}
exports.readIntoSourceFile = readIntoSourceFile;
function findModuleFromOptions(host, options) {
    // eslint-disable-next-line no-prototype-builtins
    const moduleExt = options.moduleExt || exports.MODULE_EXT;
    const routingModuleExt = options.routingModuleExt || exports.ROUTING_MODULE_EXT;
    if (!options.module) {
        const pathToCheck = (options.path || '') + '/' + options.name;
        return core_1.normalize(find_module_1.findModule(host, pathToCheck, moduleExt, routingModuleExt));
    }
    else {
        const modulePath = core_1.normalize(`/${options.path}/${options.module}`);
        const componentPath = core_1.normalize(`/${options.path}/${options.name}`);
        const moduleBaseName = core_1.normalize(modulePath).split('/').pop();
        const candidateSet = new Set([core_1.normalize(options.path || '/')]);
        for (let dir = modulePath; dir != core_1.NormalizedRoot; dir = core_1.dirname(dir)) {
            candidateSet.add(dir);
        }
        for (let dir = componentPath; dir != core_1.NormalizedRoot; dir = core_1.dirname(dir)) {
            candidateSet.add(dir);
        }
        const candidatesDirs = [...candidateSet].sort((a, b) => b.length - a.length);
        for (const c of candidatesDirs) {
            const candidateFiles = [
                '',
                `${moduleBaseName}.ts`,
                `${moduleBaseName}${moduleExt}`,
            ].map((x) => core_1.join(c, x));
            for (const sc of candidateFiles) {
                if (host.exists(sc)) {
                    return core_1.normalize(sc);
                }
            }
        }
        throw new Error(`Specified module '${options.module}' does not exist.\n` +
            `Looked in the following directories:\n    ${candidatesDirs.join('\n    ')}`);
    }
}
exports.findModuleFromOptions = findModuleFromOptions;
function addDeclarationToIndexFile(options) {
    return (host) => {
        if (!options.module) {
            options.module = findModuleFromOptions(host, options);
        }
        if (!options.module) {
            return host;
        }
        const indexPath = core_1.join(core_1.normalize(options.path), 'index.ts');
        const componentRelativePath = (options.flat ? '' : core_1.strings.dasherize(options.name) + '/') +
            core_1.strings.dasherize(options.name) +
            (options.type ? '.' : '') +
            core_1.strings.dasherize(options.type);
        const relativePath = './' + componentRelativePath;
        if (!options.skipIndexImport) {
            const source = readIntoSourceFile(host, indexPath);
            const classifiedName = core_1.strings.classify(options.name) + core_1.strings.classify(options.type);
            const declarationChanges = addSymbolToIndexMetadata(source, indexPath, classifiedName, relativePath);
            const declarationRecorder = host.beginUpdate(indexPath);
            for (const change of declarationChanges) {
                if (change instanceof change_1.InsertChange) {
                    declarationRecorder.insertLeft(change.pos, change.toAdd);
                }
            }
            host.commitUpdate(declarationRecorder);
        }
        if (options.indexExport) {
            // Need to refresh the AST because we overwrote the file in the host.
            const source = readIntoSourceFile(host, indexPath);
            const exportRecorder = host.beginUpdate(indexPath);
            const exportChanges = addExportToIndex(source, indexPath, core_1.strings.classify(options.name) + core_1.strings.classify(options.type), relativePath);
            for (const change of exportChanges) {
                if (change instanceof change_1.InsertChange) {
                    exportRecorder.insertLeft(change.pos, change.toAdd);
                }
            }
            host.commitUpdate(exportRecorder);
        }
        return host;
    };
}
exports.addDeclarationToIndexFile = addDeclarationToIndexFile;
function addClassExportToIndexFile(options) {
    return (host) => {
        options.module = findModuleFromOptions(host, options);
        if (options.skipIndexImport || !options.module) {
            return host;
        }
        const indexPath = core_1.join(core_1.normalize(options.path), 'index.ts');
        const source = readIntoSourceFile(host, indexPath);
        const componentRelativePath = core_1.strings.dasherize(options.name) +
            (options.type ? '.' : '') +
            core_1.strings.dasherize(options.type);
        const relativePath = './' + componentRelativePath;
        const classifiedName = core_1.strings.classify(options.name) + core_1.strings.classify(options.type);
        const exportRecorder = host.beginUpdate(indexPath);
        const exportChanges = addExportToIndex(source, indexPath, classifiedName, relativePath);
        for (const change of exportChanges) {
            if (change instanceof change_1.InsertChange) {
                exportRecorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(exportRecorder);
    };
}
exports.addClassExportToIndexFile = addClassExportToIndexFile;
function insertDirectoryImport(source, fileToEdit, directoryName) {
    const rootNode = source;
    const allImports = ast_utils_1.findNodes(rootNode, ts.SyntaxKind.ImportDeclaration);
    const useStrict = ast_utils_1.findNodes(rootNode, ts.isStringLiteral).filter((n) => n.text === 'use strict');
    let fallbackPos = 0;
    if (useStrict.length > 0) {
        fallbackPos = useStrict[0].end;
    }
    const toInsert = `import * as ${core_1.strings.camelize('from-' + directoryName)} from './${directoryName}';\n`;
    return insertAfterLastOccurrence(allImports, toInsert, fileToEdit, fallbackPos, ts.SyntaxKind.StringLiteral);
}
function addSymbolToNgModuleMetadata(source, ngModulePath, metadataField, directoryName, symbolName, importStatement = true) {
    const nodes = ast_utils_1.getDecoratorMetadata(source, 'NgModule', '@angular/core');
    let node = nodes[0]; // eslint-disable-line @typescript-eslint/no-explicit-any
    // Find the decorator declaration.
    if (!node) {
        return [];
    }
    // Get all the children property assignment of object literals.
    const matchingProperties = ast_utils_1.getMetadataField(node, metadataField);
    if (matchingProperties.length == 0) {
        // We haven't found the field in the metadata declaration. Insert a new field.
        const expr = node;
        let position;
        let toInsert;
        if (expr.properties.length == 0) {
            position = expr.getEnd() - 1;
            toInsert = `\n  ${metadataField}: [\n${core_1.tags.indentBy(4) `${symbolName}`}\n  ]\n`;
        }
        else {
            node = expr.properties[expr.properties.length - 1];
            position = node.getEnd();
            // Get the indentation of the last element, if any.
            const text = node.getFullText(source);
            const matches = text.match(/^(\r?\n)(\s*)/);
            if (matches) {
                toInsert =
                    `,${matches[0]}${metadataField}: [${matches[1]}` +
                        `${core_1.tags.indentBy(matches[2].length + 2) `${symbolName}`}${matches[0]}]`;
            }
            else {
                toInsert = `, ${metadataField}: [${symbolName}]`;
            }
        }
        if (importStatement) {
            return [
                new change_1.InsertChange(ngModulePath, position, toInsert),
                insertDirectoryImport(source, ngModulePath, directoryName)
            ];
        }
        return [
            new change_1.InsertChange(ngModulePath, position, toInsert)
        ];
    }
    const assignment = matchingProperties[0];
    // If it's not an array, nothing we can do really.
    if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
        return [];
    }
    const arrLiteral = assignment.initializer;
    if (arrLiteral.elements.length == 0) {
        // Forward the property.
        node = arrLiteral;
    }
    else {
        node = arrLiteral.elements;
    }
    if (Array.isArray(node)) {
        const nodeArray = node;
        const symbolsArray = nodeArray.map((node) => core_1.tags.oneLine `${node.getText()}`);
        if (symbolsArray.includes(core_1.tags.oneLine `${symbolName}`)) {
            return [];
        }
        node = node[node.length - 1];
    }
    let toInsert;
    let position = node.getEnd();
    if (node.kind == ts.SyntaxKind.ArrayLiteralExpression) {
        // We found the field but it's empty. Insert it just before the `]`.
        position--;
        toInsert = `\n${core_1.tags.indentBy(4) `${symbolName}`}\n  `;
    }
    else {
        // Get the indentation of the last element, if any.
        const text = node.getFullText(source);
        const matches = text.match(/^(\r?\n)(\s*)/);
        if (matches) {
            toInsert = `,${matches[1]}${core_1.tags.indentBy(matches[2].length) `${symbolName}`}`;
        }
        else {
            toInsert = `, ${symbolName}`;
        }
    }
    if (importStatement) {
        return [
            new change_1.InsertChange(ngModulePath, position, toInsert),
            insertDirectoryImport(source, ngModulePath, directoryName)
        ];
    }
    return [
        new change_1.InsertChange(ngModulePath, position, toInsert)
    ];
}
function addDeclarationToModuleFile(options) {
    return (host) => {
        if (!options.module) {
            return host;
        }
        const modulePath = options.module;
        let metadataField;
        switch (options.name) {
            case 'components':
            case 'containers':
            case 'directives':
            case 'pipes':
                metadataField = 'declarations';
                break;
            case 'services':
            case 'guards':
            case 'repositories':
                metadataField = 'providers';
                break;
        }
        const symbolName = `...${core_1.strings.camelize('from-' + options.name)}.${options.name}`;
        const source = readIntoSourceFile(host, modulePath);
        const declarationChanges = addSymbolToNgModuleMetadata(source, modulePath, metadataField, options.name, symbolName);
        const declarationRecorder = host.beginUpdate(modulePath);
        for (const change of declarationChanges) {
            if (change instanceof change_1.InsertChange) {
                declarationRecorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(declarationRecorder);
        if (options.name === "pipes") {
            // need to also add it to providers
            const _source = readIntoSourceFile(host, modulePath);
            const _declarationChanges = addSymbolToNgModuleMetadata(_source, modulePath, "providers", options.name, symbolName, false);
            const _declarationRecorder = host.beginUpdate(modulePath);
            for (const _change of _declarationChanges) {
                if (_change instanceof change_1.InsertChange) {
                    _declarationRecorder.insertLeft(_change.pos, _change.toAdd);
                }
            }
            host.commitUpdate(_declarationRecorder);
        }
        if (options.export) {
            // Need to refresh the AST because we overwrote the file in the host.
            const _source = readIntoSourceFile(host, modulePath);
            const _exportRecorder = host.beginUpdate(modulePath);
            const _exportChanges = addSymbolToNgModuleMetadata(_source, modulePath, 'exports', options.name, symbolName, false);
            for (const _change of _exportChanges) {
                if (_change instanceof change_1.InsertChange) {
                    _exportRecorder.insertLeft(_change.pos, _change.toAdd);
                }
            }
            host.commitUpdate(_exportRecorder);
        }
        return host;
    };
}
exports.addDeclarationToModuleFile = addDeclarationToModuleFile;
function getJsonValueNode(nodes, key) {
    const jsonEntryNode = nodes.filter((node) => node.kind === ts.SyntaxKind.PropertyAssignment && node.name.text === key);
    if (!jsonEntryNode || jsonEntryNode.length === 0) {
        return null;
    }
    const children = jsonEntryNode[0].getChildren();
    if (!children || children.length < 3) {
        return null;
    }
    // the first item in the array will be the key, the second will be the ':', and the third will be the value
    // here we only consider the case in which we have another object as value
    const value = children[2].getChildren().filter((node) => node.kind === ts.SyntaxKind.SyntaxList);
    if (!value || value.length === 0) {
        return null;
    }
    return value[0];
}
function addPathHelper(source, projectPrefix, moduleName) {
    const compilerOptionsNode = getJsonValueNode(ast_utils_1.getSourceNodes(source), 'compilerOptions');
    if (!compilerOptionsNode) {
        return [];
    }
    const paths = getJsonValueNode(compilerOptionsNode.getChildren(), 'paths');
    if (!paths) {
        return [];
    }
    const toInsert = `${paths.getText() ? ',' : ''}\n\t\t\t"@${projectPrefix}/${moduleName}/*": ["${projectPrefix}/${moduleName}/*"]`;
    return [
        new change_1.InsertChange('/tsconfig.json', paths.end, toInsert)
    ];
}
function addPathToTsconfig(options, project) {
    return (host) => {
        const source = readIntoSourceFile(host, '/tsconfig.json');
        const declarationChanges = addPathHelper(source, project.prefix, options.name);
        const declarationRecorder = host.beginUpdate('/tsconfig.json');
        for (const change of declarationChanges) {
            if (change instanceof change_1.InsertChange) {
                declarationRecorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(declarationRecorder);
        return host;
    };
}
exports.addPathToTsconfig = addPathToTsconfig;
