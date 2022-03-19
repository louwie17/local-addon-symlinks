"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatHomePath = void 0;
const os_1 = __importDefault(require("os"));
const unslashit = (str) => {
    if (typeof str !== 'string') {
        return str;
    }
    return str.replace(/\/+$/, '').replace(/\\+$/, '');
};
exports.formatHomePath = (path, untrailingslashit = true) => {
    if (typeof path !== 'string') {
        return path;
    }
    const homedir = os_1.default.homedir();
    let output = path.replace(/^~\//, `${homedir}/`).replace(/^~\\/, `${homedir}\\`);
    if (untrailingslashit) {
        output = unslashit(output);
    }
    return output;
};
//# sourceMappingURL=formatHomePath.js.map