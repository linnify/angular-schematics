export interface Schema {
  name: Directory;
  path?: string;
  module?: string;
  project?: string;
  export?: boolean;
}

export declare enum Directory {
  components = 'components',
  containers = 'containers',
  directives = 'directives',
  guards = 'guards',
  pipes = 'pipes',
  services = 'services',
  types = 'types',
  repositories = 'repositories',
}
