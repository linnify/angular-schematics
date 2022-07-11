import {AbstractControlType, ControlComponentType} from '../enums';

export class ControlConfig {
  type: AbstractControlType;
  validators?: any;
  name: string;
  disabled?: boolean;
  initialValue?: any;
  component?: string;
  label?: string;

  constructor(data: ControlConfig) {
    this.type = data.type;
    this.validators = typeof data.validators === 'string' ? data.validators.trim() : data.validators;
    this.name = data.name;
    this.disabled = data.disabled;
    this.initialValue = data.initialValue;
    this.component = data.component;
    this.label = data.label;
  }
}
