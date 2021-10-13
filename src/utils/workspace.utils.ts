const core_1 = require("@angular-devkit/core");

export function createHost(tree) {
  return {
    async readFile(path) {
      const data = tree.read(path);
      if (!data) {
        throw new Error('File not found.');
      }
      return core_1.virtualFs.fileBufferToString(data);
    },
    async writeFile(path, data) {
      return tree.overwrite(path, data);
    },
    async isDirectory(path) {
      // approximate a directory check
      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;
    },
    async isFile(path) {
      return tree.exists(path);
    },
  };
}