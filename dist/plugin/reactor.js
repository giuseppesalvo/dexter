"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
var ReactorEvent;
(function (ReactorEvent) {
    ReactorEvent["Init"] = "init";
    ReactorEvent["Text"] = "text";
})(ReactorEvent = exports.ReactorEvent || (exports.ReactorEvent = {}));
class ReactorPlugin extends base_1.BasePlugin {
    constructor(settings) {
        super();
        this.settings = settings;
    }
    resolveOnInit(bot) {
        this.emit(ReactorEvent.Init, {
            bot: bot,
            plugin: this,
        });
        return Promise.resolve();
    }
    run(bot, message) {
        this.emit(ReactorEvent.Text, {
            bot: bot,
            message: message,
            plugin: this,
            sender: message.sender,
        });
    }
    resolveOnText(bot, msg) {
        const triggered = this.checkTrigger(this.settings.trigger, msg.text);
        if (triggered) {
            this.run(bot, msg);
        }
        return Promise.resolve();
    }
}
exports.ReactorPlugin = ReactorPlugin;
//# sourceMappingURL=reactor.js.map