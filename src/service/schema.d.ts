import {Schema as ServiceSchema} from '@schematics/angular/service/schema';

export interface Schema extends ServiceSchema {
  skipLinnifyImport: boolean;
  type: string;
  export: boolean;
}
