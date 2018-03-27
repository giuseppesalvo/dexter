import { Bot } from '../bot';
import { Message } from '../message';
import { User } from '../user';
import { BasePlugin } from './base';
import { Plugin } from './index';
import { Session } from './session';
import { Storage } from './storage';
export declare type StateFn = (ctx: DialogCtx) => void;
export interface DialogSettings {
    name: string;
    trigger: string | RegExp;
    states: StateFn[];
    storage?: Storage;
    remindEvery: number;
    expireAfter: number;
}
export interface DialogCtx {
    bot: Bot;
    plugin: DialogPlugin;
    sender?: User;
    message?: Message;
    session?: Session;
}
export declare enum DialogEvent {
    Init = "init",
    SessionEnd = "session_end",
    SessionExpired = "session_expired",
    SessionRemind = "session_remind",
    SessionStart = "session_start",
    Text = "text",
}
export declare class DialogPlugin extends BasePlugin implements Plugin {
    settings: DialogSettings;
    private storage;
    constructor(settings: DialogSettings);
    resolveOnInit(bot: Bot): Promise<void>;
    resolveOnText(bot: Bot, msg: Message): Promise<void | Session>;
    run(bot: Bot, msg: Message): Promise<void | Session>;
    runSessionForUserId(bot: Bot, id: string | number): Promise<any>;
    /**
     * Session Methods
     *
     */
    repeatSessionFromCtx(ctx: DialogCtx): Promise<void>;
    private startSession(bot, user);
    endSession(bot: Bot, user: User, session: Session): void;
    private getSessionByUserId(id);
    private isSessionRunningForUser(id);
    private sendQuestionForSession(session, bot, user, msg?);
    /**
     * Timeout methods
     *
     */
    private clearExpireTimeoutToSession(session, bot);
    private setExpireTimeoutToSession(session, bot, user);
    /**
     * Interval methods
     *
     */
    private clearRemindIntervalToSession(session, bot);
    private setRemindIntervalToSession(session, bot, user);
}
