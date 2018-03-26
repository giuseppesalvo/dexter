import { Bot } from '../bot';
import { Message } from '../message';
import { User } from '../user';
import { BasePlugin } from './base';
import { Plugin } from './index';
export interface ReactorSettings {
    name: string;
    trigger: string | RegExp;
}
export interface ReactorCtx {
    plugin: ReactorPlugin;
    bot: Bot;
    message?: Message;
    sender?: User;
}
export declare enum ReactorEvent {
    Init = "init",
    Text = "text",
}
export declare class ReactorPlugin extends BasePlugin implements Plugin {
    settings: ReactorSettings;
    constructor(settings: ReactorSettings);
    resolveOnInit(bot: Bot): Promise<void>;
    run(bot: Bot, message: Message): void;
    resolveOnText(bot: Bot, msg: Message): Promise<void>;
}
