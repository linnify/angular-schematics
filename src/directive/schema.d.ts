import {Schema as DirectiveSchema} from '@schematics/angular/directive/schema';

export interface Schema extends DirectiveSchema {
  skipIndexImport: boolean;
  type: string;
  indexExport: boolean;
}
