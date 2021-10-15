import {Schema as GuardSchema} from '@schematics/angular/guard/schema';

export interface Schema extends GuardSchema {
  skipIndexImport: boolean;
  type: string;
  indexExport: boolean;
}
