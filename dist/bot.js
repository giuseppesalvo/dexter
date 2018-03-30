"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Telegraf = require("telegraf");
const Readline = require("readline");
var Mode;
(function (Mode) {
    Mode[Mode["Telegram"] = 1] = "Telegram";
    Mode[Mode["Debug"] = 2] = "Debug";
})(Mode = exports.Mode || (exports.Mode = {}));
class Bot {
    // If you put public or private before a constructor argument,
    // it will be added to the class scope, so, you can find it with this.yourargumentname
    // in this case -> this.settings
    constructor(settings) {
        this.settings = settings;
        this.plugins = [];
        this.plugins = this.settings.plugins || [];
    }
    getChatInfo(id) {
        if (this.settings.mode === Mode.Debug) {
            // In debug mode, id and name are equals
            return Promise.resolve({
                id: id,
                name: id,
            });
        }
        else {
            return this.telegraf.telegram.getChat(id).then((t_user) => {
                const user = {
                    id: t_user.id,
                    name: t_user.first_name,
                    telegram: t_user,
                };
                return Promise.resolve(user);
            });
        }
    }
    start() {
        if (this.settings.mode === Mode.Telegram)
            return this.startTelegram();
        if (this.settings.mode === Mode.Debug)
            return this.startDebug();
        console.log('Invalid bot mode');
    }
    startDebug() {
        return __awaiter(this, void 0, void 0, function* () {
            const rl = Readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                terminal: true,
                prompt: "→ ",
            });
            yield this.pluginsOnInit();
            rl.prompt();
            rl.on('line', (line) => __awaiter(this, void 0, void 0, function* () {
                let text = line;
                let user_id = "telegram_user";
                if (/[A-Z]{2,2}:\s.+/.test(line)) {
                    user_id = line.substr(0, 2);
                    text = line.substr(4);
                }
                const user = {
                    id: user_id,
                    name: user_id,
                    telegram: null,
                };
                const msg = {
                    id: Date.now(),
                    text: text,
                    sender: user,
                };
                yield this.pluginsOnText(msg);
                rl.prompt();
            }));
        });
    }
    startTelegram() {
        const tl = new Telegraf(this.settings.token);
        this.telegraf = tl;
        this.pluginsOnInit();
        tl.on('message', (ctx) => {
            const user = {
                id: ctx.message.from.id,
                name: ctx.message.from.first_name,
                telegram: ctx.message.from,
            };
            const msg = {
                id: ctx.message.id,
                text: ctx.message.text,
                sender: user,
                telegram: ctx.message,
            };
            this.pluginsOnText(msg);
        });
        tl.startPolling();
    }
    arePluginsOk() {
        return this.plugins && this.plugins.length > 0;
    }
    pluginsOnInit() {
        if (!this.arePluginsOk())
            return;
        return Promise.all(this.plugins.map(plugin => {
            return plugin.resolveOnInit(this);
        }));
    }
    pluginsOnText(msg) {
        if (!this.arePluginsOk())
            return;
        return Promise.all(this.plugins.map(plugin => {
            return plugin.resolveOnText(this, msg);
        }));
    }
    sendMessage(msg, sender, options = null) {
        if (this.settings.mode === Mode.Debug) {
            console.log("🤖: " + msg);
            if (options) {
                if (options.reply_markup && options.reply_markup.keyboard) {
                    const keyboard = options.reply_markup.keyboard.map((v) => {
                        return "[" + v.join(", ") + "]";
                    }).join("\n");
                    console.log(keyboard);
                }
            }
            return Promise.resolve();
        }
        else if (this.settings.mode === Mode.Telegram) {
            if (options) {
                return this.telegraf.telegram.sendMessage(sender.id, msg, options);
            }
            else {
                return this.telegraf.telegram.sendMessage(sender.id, msg, {
                    reply_markup: {
                        remove_keyboard: true
                    }
                });
            }
        }
    }
}
exports.Bot = Bot;
//# sourceMappingURL=bot.js.map