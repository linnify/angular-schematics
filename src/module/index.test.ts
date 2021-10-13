import {Tree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';

import {
  Schema as ApplicationOptions,
  Style
} from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { Schema as ModuleOptions } from './schema';

const workspaceOptions: WorkspaceOptions = {
  name: 'workspace',
  newProjectRoot: 'projects',
  version: '10.0.0'
};

const appOptions: ApplicationOptions = {
  name: 'bar',
  inlineStyle: false,
  inlineTemplate: false,
  routing: false,
  style: Style.Css,
  skipTests: false,
  skipPackageJson: false
};

const defaultOptions: Partial<ModuleOptions> = {
  name: 'foo',
  flat: false,
  project: 'bar',
  module: undefined,
};

const runner = new SchematicTestRunner('schematics', require.resolve('../collection.json'),);

let appTree: UnitTestTree;

describe('linnify-schematics', () => {
  beforeEach(async () => {
    appTree = await runner.runExternalSchematicAsync(
      '@schematics/angular',
      'workspace',
      workspaceOptions
    ).toPromise();
    appTree = await runner.runExternalSchematicAsync(
      '@schematics/angular',
      'application',
      appOptions,
      appTree
    ).toPromise();
  })

  it('should create a module file', async () => {
    const tree = await runner
      .runSchematicAsync('linnify-module', defaultOptions, Tree.empty())
      .toPromise();

    expect(tree.files.includes('/projects/bar/src/app/foo/foo.module.ts'));
  });
});
