"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("events");
class BasePlugin extends EventEmitter {
    checkTrigger(trigger, text) {
        if (trigger instanceof RegExp) {
            return trigger.test(text);
        }
        else if (typeof trigger === "string") {
            return text === trigger;
        }
        else {
            return false;
        }
    }
}
exports.BasePlugin = BasePlugin;
//# sourceMappingURL=base.js.map