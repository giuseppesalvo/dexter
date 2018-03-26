/// <reference types="node" />
import { Message } from "../message";
import { DialogCtx } from './dialog';
export declare class Session {
    userId: number | string;
    stateIndex: number;
    createdAt: number;
    cronology: Message[];
    remindInterval: NodeJS.Timer;
    expireTimeout: NodeJS.Timer;
    data: any;
    running: boolean;
    constructor(UserId: number | string);
    end(ctx: DialogCtx): void;
    goBack(ctx: DialogCtx): void;
    error(ctx: DialogCtx): void;
    stayHere(ctx: DialogCtx): void;
    goTo(ctx: DialogCtx, index: number): void;
    goToStart(ctx: DialogCtx): void;
    waitForAnswer(ctx: DialogCtx): void;
    waitForAnswerAndGoTo(ctx: DialogCtx, index: number): void;
    skipToNext(ctx: DialogCtx): void;
}
