import {Schema as ServiceSchema} from '@schematics/angular/service/schema';

export interface Schema extends ServiceSchema {
  skipIndexImport: boolean;
  type: string;
  indexExport: boolean;
  repo: boolean;
}
