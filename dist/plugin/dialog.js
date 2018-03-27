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
            const isRunning = yield this.isSessionRunningForUser(msg.sender.id);
            if (this.checkTrigger(this.settings.trigger, msg.text) || isRunning) {
                return this.run(bot, msg);
            }
            return Promise.resolve();
        });
    }
    run(bot, msg) {
        console.log('running');
        return Promise.all([
            this.getSessionByUserId(msg.sender.id),
            this.isSessionRunningForUser(msg.sender.id),
        ]).then((args) => __awaiter(this, void 0, void 0, function* () {
            const session = args[0];
            const isRunning = args[1];
            this.setRemindIntervalToSession(session, bot, msg.sender);
            this.setExpireTimeoutToSession(session, bot, msg.sender);
            if (!isRunning) {
                return this.startSession(bot, msg.sender);
            }
            else {
                this.sendQuestionForSession(session, bot, msg.sender, msg);
                return Promise.resolve();
            }
        }));
    }
    runSessionForUserId(bot, id) {
        return Promise.all([
            bot.getChatInfo(id),
            this.getSessionByUserId(id),
            this.isSessionRunningForUser(id),
        ]).then((args) => __awaiter(this, void 0, void 0, function* () {
            const user = args[0];
            const session = args[1];
            const isRunning = args[2];
            this.setRemindIntervalToSession(session, bot, user);
            this.setExpireTimeoutToSession(session, bot, user);
            if (!isRunning) {
                return this.startSession(bot, user);
            }
            else {
                console.log('session is already running');
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
            const session = yield this.getSessionByUserId(ctx.sender.id);
            this.sendQuestionForSession(session, ctx.bot, ctx.sender, ctx.message);
        });
    }
    startSession(bot, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.getSessionByUserId(user.id);
            session.running = true;
            this.emit(DialogEvent.SessionStart, {
                plugin: this,
                bot: bot,
                sender: user,
                session: session,
            });
            this.sendQuestionForSession(session, bot, user);
            return session;
        });
    }
    endSession(bot, user, session) {
        this.clearRemindIntervalToSession(session, bot);
        this.clearExpireTimeoutToSession(session, bot);
        this.emit(DialogEvent.SessionEnd, {
            plugin: this,
            bot: bot,
            sender: user,
            session: session,
        });
        this.storage.deleteSessionByUserId(user.id);
    }
    getSessionByUserId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.storage.getSessionByUserId(id);
            if (session) {
                return session;
            }
            else {
                const session = new session_1.Session(id);
                yield this.storage.setSessionByUserId(id, session);
                return session;
            }
        });
    }
    isSessionRunningForUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.storage.getSessionByUserId(id);
            return !!session && session.running;
        });
    }
    sendQuestionForSession(session, bot, user, msg = null) {
        const state = this.settings.states[session.stateIndex];
        const ctx = {
            plugin: this,
            bot: bot,
            sender: user,
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
    setExpireTimeoutToSession(session, bot, user) {
        if (this.settings.expireAfter > 0) {
            this.clearExpireTimeoutToSession(session, bot);
            session.expireTimeout = setTimeout(() => {
                this.clearRemindIntervalToSession(session, bot);
                this.emit(DialogEvent.SessionExpired, {
                    plugin: this,
                    bot: bot,
                    session: session,
                    sender: user,
                });
                this.storage.deleteSessionByUserId(session.userId);
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
    setRemindIntervalToSession(session, bot, user) {
        if (this.settings.remindEvery > 0) {
            this.clearRemindIntervalToSession(session, bot);
            session.remindInterval = setInterval(() => {
                this.emit(DialogEvent.SessionRemind, {
                    plugin: this,
                    bot: bot,
                    session: session,
                    sender: user,
                });
            }, this.settings.remindEvery);
        }
    }
}
exports.DialogPlugin = DialogPlugin;
//# sourceMappingURL=dialog.js.map