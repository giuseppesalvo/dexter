import { Plugin } from './plugin';
import { User } from './user';
export declare enum Mode {
    Telegram = 1,
    Debug = 2,
}
export interface Settings {
    token: string;
    mode: Mode;
    plugins?: Plugin[];
}
export declare class Bot {
    settings: Settings;
    plugins: Plugin[];
    telegraf: any;
    constructor(settings: Settings);
    getChatInfo(id: string | number): Promise<User>;
    start(): void | Promise<void>;
    startDebug(): Promise<void>;
    private startTelegram();
    private arePluginsOk();
    private pluginsOnInit();
    private pluginsOnText(msg);
    sendMessage(msg: string, sender: User, options?: any | null): any;
}
