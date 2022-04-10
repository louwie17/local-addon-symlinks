"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePreferencesToDisk = exports.readPreferencesFromDisk = void 0;
const LocalMain = __importStar(require("@getflywheel/local/main"));
const constants_1 = require("../constants");
const serviceContainer = LocalMain.getServiceContainer().cradle;
function readPreferencesFromDisk() {
    return serviceContainer.userData.get(constants_1.PREFERENCES_FILE_NAME, {});
}
exports.readPreferencesFromDisk = readPreferencesFromDisk;
function savePreferencesToDisk(preferences) {
    serviceContainer.userData.set(constants_1.PREFERENCES_FILE_NAME, preferences);
}
exports.savePreferencesToDisk = savePreferencesToDisk;
//# sourceMappingURL=preferences.js.map