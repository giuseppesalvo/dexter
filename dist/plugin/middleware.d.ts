import { Bot } from '../bot';
import { Message } from '../message';
export interface Middleware {
    onText(bot: Bot, msg: Message): void;
}
