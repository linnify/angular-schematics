import {chain, noop, Rule, schematic, Tree} from '@angular-devkit/schematics';
import {Schema} from './schema';
import {addDeclarationToIndexFile} from '../utils/imports-utils';
import {generateFromFiles, parseModuleName, setOptions} from '../utils/shared-utils';
import {strings, normalize, join} from '@angular-devkit/core';

export function service(options: Schema): Rule {
  return async (host: Tree) => {
    const project = await setOptions(host, options);

    options.type = 'service';

    const flat = options.flat;
    options.flat = true;

    const module = parseModuleName(options.path, 'services');
    const repoPath = normalize(options.path.replace('services', 'repositories'));
    const modulePath = normalize(options.path.replace('services', ''));

    const repoOptions = {
      module,
      flat: options.flat,
      name: options.name,
      project: options.project,
      skipImport: true,
      path: repoPath
    };

    let hasRepoDirectory;
    let repoDirectoryOptions;
    const indexPath = join(normalize(repoPath), 'index.ts');
    const text = host.read(indexPath);
    if (text === null) {
      hasRepoDirectory = false;
      repoDirectoryOptions = {
        name: 'repositories',
        module,
        project: options.project,
        path: modulePath
      }
    }

    return chain([chain([
      generateFromFiles(options, {
        ...strings,
        'if-flat': (s) => (flat ? '' : s),
        repo: !!options.repo,
        appPrefix: project.prefix,
        module
      }),
      addDeclarationToIndexFile(options),
      !hasRepoDirectory ? schematic('l-dir', repoDirectoryOptions) : noop()
    ]), options.repo ? schematic('repo', repoOptions) : noop()]);
  };
}
