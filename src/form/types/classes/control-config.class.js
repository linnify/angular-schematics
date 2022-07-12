"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlConfig = void 0;
class ControlConfig {
    constructor(data) {
        this.type = data.type;
        this.validators = typeof data.validators === 'string' ? data.validators.trim() : data.validators;
        this.name = data.name;
        this.disabled = data.disabled;
        this.initialValue = data.initialValue;
        this.component = data.component;
        this.label = data.label;
    }
}
exports.ControlConfig = ControlConfig;
