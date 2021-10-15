import {Schema as PipeSchema} from '@schematics/angular/pipe/schema';

export interface Schema extends PipeSchema {
  skipIndexImport: boolean;
  type: string;
  indexExport: boolean;
}
