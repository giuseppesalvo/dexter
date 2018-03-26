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
const base_1 = require("./base");
const session_1 = require("./session");
const storage_1 = require("./storage");
var DialogEvent;
(function (DialogEvent) {
    DialogEvent["Init"] = "init";
    DialogEvent["SessionEnd"] = "session_end";
    DialogEvent["SessionExpired"] = "session_expired";
    DialogEvent["SessionRemind"] = "session_remind";
    DialogEvent["SessionStart"] = "session_start";
    DialogEvent["Text"] = "text";
})(DialogEvent = exports.DialogEvent || (exports.DialogEvent = {}));
class DialogPlugin extends base_1.BasePlugin {
    constructor(settings) {
        super();
        this.settings = settings;
        this.storage = this.settings.storage || new storage_1.MapPluginStorage();
    }
    resolveOnInit(bot) {
        this.emit(DialogEvent.Init, {
            bot: bot,
            plugin: this,
        });
        return Promise.resolve();
    }
    resolveOnText(bot, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const isRunning = yield this.isSessionRunningForUser(msg.sender);
            if (this.checkTrigger(this.settings.trigger, msg.text) || isRunning) {
                return this.run(bot, msg);
            }
            return Promise.resolve();
        });
    }
    run(bot, msg) {
        return Promise.all([
            this.getSession(msg.sender),
            this.isSessionRunningForUser(msg.sender),
        ]).then((args) => __awaiter(this, void 0, void 0, function* () {
            const session = args[0];
            const isRunning = args[1];
            this.setRemindIntervalToSession(session, bot);
            this.setExpireTimeoutToSession(session, bot);
            if (!isRunning) {
                return this.startSession(bot, msg);
            }
            else {
                this.sendQuestionForSession(session, bot, msg);
                return Promise.resolve();
            }
        }));
    }
    /**
     * Session Methods
     *
     */
    repeatSessionFromCtx(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.getSession(ctx.sender);
            this.sendQuestionForSession(session, ctx.bot, ctx.message);
        });
    }
    startSession(bot, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.getSession(msg.sender);
            session.running = true;
            this.emit(DialogEvent.SessionStart, {
                plugin: this,
                bot: bot,
                sender: msg.sender,
                message: msg,
                session: session,
            });
            this.sendQuestionForSession(session, bot, msg);
            return session;
        });
    }
    endSession(bot, msg, session) {
        this.clearRemindIntervalToSession(session, bot);
        this.clearExpireTimeoutToSession(session, bot);
        this.emit(DialogEvent.SessionEnd, {
            plugin: this,
            bot: bot,
            sender: msg.sender,
            message: msg,
            session: session,
        });
        this.storage.deleteSessionForUserId(msg.sender.id);
    }
    getSession(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.storage.getSessionByUserId(user.id);
            if (session) {
                return session;
            }
            else {
                const session = new session_1.Session(user.id);
                yield this.storage.setSessionForUserId(user.id, session);
                return session;
            }
        });
    }
    isSessionRunningForUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.storage.getSessionByUserId(user.id);
            return !!session && session.running;
        });
    }
    sendQuestionForSession(session, bot, msg) {
        const state = this.settings.states[session.stateIndex];
        const ctx = {
            plugin: this,
            bot: bot,
            sender: msg.sender,
            session: session,
            message: msg,
        };
        state(ctx);
        this.emit(DialogEvent.Text, ctx);
    }
    /**
     * Timeout methods
     *
     */
    clearExpireTimeoutToSession(session, bot) {
        clearTimeout(session.expireTimeout);
    }
    setExpireTimeoutToSession(session, bot) {
        if (this.settings.expireAfter > 0) {
            this.clearExpireTimeoutToSession(session, bot);
            session.expireTimeout = setTimeout(() => {
                this.clearRemindIntervalToSession(session, bot);
                this.emit(DialogEvent.SessionExpired, {
                    plugin: this,
                    bot: bot,
                    session: session,
                });
                this.storage.deleteSessionForUserId(session.userId);
            }, this.settings.expireAfter);
        }
    }
    /**
     * Interval methods
     *
     */
    clearRemindIntervalToSession(session, bot) {
        clearInterval(session.remindInterval);
    }
    setRemindIntervalToSession(session, bot) {
        if (this.settings.remindEvery > 0) {
            this.clearRemindIntervalToSession(session, bot);
            session.remindInterval = setInterval(() => {
                this.emit(DialogEvent.SessionRemind, {
                    plugin: this,
                    bot: bot,
                    session: session,
                });
            }, this.settings.remindEvery);
        }
    }
}
exports.DialogPlugin = DialogPlugin;
//# sourceMappingURL=dialog.js.map