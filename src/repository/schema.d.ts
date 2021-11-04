export interface Schema {
  flat?: boolean;
  name: string;
  path?: string;
  project?: string;
  skipTests?: boolean;
  skipIndexImport: boolean;
  type: string;
  indexExport: boolean;
}
