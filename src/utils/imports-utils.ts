// @ts-ignore
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true, get: function () {
      return m[k];
    }
  });
}) : (function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
}));
// @ts-ignore
var __setModuleDefault: any = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
  Object.defineProperty(o, "default", {enumerable: true, value: v});
}) : function (o, v) {
  o["default"] = v;
});
// @ts-ignore
var __importStar = (this && this.__importStar) || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k, undefined);
  __setModuleDefault(result, mod);
  return result;
};

import {InsertChange} from '@schematics/angular/utility/change';
import {Rule} from '@angular-devkit/schematics';
import {join, normalize} from '@angular-devkit/core';

const schematics_1 = require("@angular-devkit/schematics");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const ts_1 = __importStar(require("@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript"));
const core_1 = require("@angular-devkit/core");
const change_1 = require("@schematics/angular/utility/change");
const find_module_1 = require("@schematics/angular/utility/find-module");


function addSymbolToIndexMetadata(source, indexPath, symbolName, importPath = null): InsertChange[] {
  const nodes = ast_utils_1.getSourceNodes(source)
    .filter((node) => node.kind === ts_1.SyntaxKind.ArrayLiteralExpression);

  // should be only one array in the index file
  if (!nodes || nodes.length !== 1) {
    return [];
  }

// @ts-ignore
  let node: ts_1.Node = (nodes[0] as ts_1.ArrayLiteralExpression).elements;

  if (Array.isArray(node)) {
    const nodeArray = node;
    const symbolsArray = nodeArray.map((node) => core_1.tags.oneLine`${node.getText()}`);
    if (symbolsArray.includes(core_1.tags.oneLine`${symbolName}`)) {
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
    toInsert = `\n${core_1.tags.indentBy(2)`${symbolName}`}\n`;
  } else {
    // Get the indentation of the last element, if any.
    const text = node.getFullText(source);
    const matches = text.match(/^(\r?\n)(\s*)/);
    if (matches) {
      toInsert = `,${matches[1]}${core_1.tags.indentBy(matches[2].length)`${symbolName}`}`;
    } else {
      toInsert = `, ${symbolName}`;
    }
  }
  if (importPath !== null) {
    return [
      new change_1.InsertChange(indexPath, position, toInsert),
      ast_utils_1.insertImport(source, indexPath, symbolName.replace(/\..*$/, ''), importPath),
    ];
  }
  return [new change_1.InsertChange(indexPath, position, toInsert)];
}

function insertAfterLastOccurrence(nodes, toInsert, file, fallbackPos, syntaxKind) {
  let lastItem;
  for (const node of nodes) {
    if (!lastItem || lastItem.getStart() < node.getStart()) {
      lastItem = node;
    }
  }
  if (syntaxKind && lastItem) {
    lastItem = ast_utils_1.findNodes(lastItem, syntaxKind).sort(ast_utils_1.nodesByPosition).pop();
  }
  if (!lastItem && fallbackPos == undefined) {
    throw new Error(`tried to insert ${toInsert} as first occurence with no fallback position`);
  }
  const lastItemPosition = lastItem ? lastItem.getEnd() + 2 : fallbackPos;
  return new change_1.InsertChange(file, lastItemPosition, toInsert);
}

function addExportToIndex(source, indexPath, symbolName, importPath = null): InsertChange[] {
  if (importPath === null) {
    return [];
  }
  const rootNode = source;
  const allExports = ast_utils_1.findNodes(rootNode, ts_1.SyntaxKind.ExportDeclaration);
  const toExport = `export * from '${importPath}';\n`;
  const fallbackPos = rootNode.end;
  return [
    insertAfterLastOccurrence(allExports, toExport, indexPath, fallbackPos, ts_1.SyntaxKind.StringLiteral)
  ]
}

function readIntoSourceFile(host, modulePath) {
  const text = host.read(modulePath);
  if (text === null) {
    throw new schematics_1.SchematicsException(`File ${modulePath} does not exist.`);
  }
  const sourceText = text.toString('utf-8');
  return ts_1.createSourceFile(modulePath, sourceText, ts_1.ScriptTarget.Latest, true);
}

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

export function addDeclarationToIndexFile(options: any): Rule{
  return (host) => {
    options.module = findModuleFromOptions(host, options);
    if (options.skipLinnifyImport || !options.module) {
      return host;
    }

    const indexPath = join(normalize(options.path), 'index.ts');

    const source = readIntoSourceFile(host, indexPath);

    const componentRelativePath = (options.flat ? '' : core_1.strings.dasherize(options.name) + '/') +
      core_1.strings.dasherize(options.name) +
      (options.type ? '.' : '') +
      core_1.strings.dasherize(options.type);
    const relativePath = './' + componentRelativePath;
    const classifiedName = core_1.strings.classify(options.name) + core_1.strings.classify(options.type);

    const declarationChanges = addSymbolToIndexMetadata(source, indexPath, classifiedName, relativePath);
    const declarationRecorder = host.beginUpdate(indexPath);
    for (const change of declarationChanges) {
      if (change instanceof change_1.InsertChange) {
        declarationRecorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(declarationRecorder);
    if (options.export) {
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
  }
}
