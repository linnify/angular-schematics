import {ControlConfig} from './control-config.class';

export class FormConfig {
  controls: ControlConfig[];
  nestedForm?: boolean;
  buttonLabel?: string;

  constructor(data: FormConfig) {
    this.controls = data.controls.map(control => new ControlConfig(control));
    this.nestedForm = data.nestedForm;
    this.buttonLabel = data.buttonLabel;
  }
}

