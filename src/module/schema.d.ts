import {Schema as ModuleSchema} from '@schematics/angular/module/schema';

export interface Schema extends ModuleSchema{
  components: boolean;
  containers: boolean;
  directives: boolean;
  guards: boolean;
  pipes: boolean;
  services: boolean;
  types: boolean;
  sharedModule: boolean;
}
