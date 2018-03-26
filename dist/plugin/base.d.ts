/// <reference types="node" />
import * as EventEmitter from 'events';
export declare class BasePlugin extends EventEmitter {
    checkTrigger(trigger: string | RegExp, text: string): boolean;
}
