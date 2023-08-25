"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDebounce = exports.debounce = void 0;
const react_1 = require("react");
function debounce(fn, ms) {
    let timer;
    const debouncedFunc = (args) => new Promise((resolve) => {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            resolve(fn(args));
        }, ms);
    });
    const teardown = () => clearTimeout(timer);
    return [debouncedFunc, teardown];
}
exports.debounce = debounce;
exports.useDebounce = (fn, ms) => {
    const [debouncedFun, teardown] = debounce(fn, ms);
    react_1.useEffect(() => () => teardown(), []);
    return debouncedFun;
};
//# sourceMappingURL=debounce.js.map