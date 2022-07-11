"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormConfig = void 0;
const control_config_class_1 = require("./control-config.class");
class FormConfig {
    constructor(data) {
        this.controls = data.controls.map(control => new control_config_class_1.ControlConfig(control));
        this.nestedForm = data.nestedForm;
        this.buttonLabel = data.buttonLabel;
    }
}
exports.FormConfig = FormConfig;
