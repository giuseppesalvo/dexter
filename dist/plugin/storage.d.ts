import { Session } from "./session";
/**
 * Customizable PluginStorage for retrieving user sessions in conversational plugins
 */
export interface Storage {
    getSessionByUserId(id: number | string): Promise<Session>;
    setSessionForUserId(id: number | string, state: Session): Promise<boolean>;
    deleteSessionForUserId(id: number | string): Promise<boolean>;
}
/**
 * In memory storage with map[string]*Session
 * Default bot storage
 */
export declare class MapPluginStorage implements Storage {
    sessions: any;
    getSessionByUserId(id: number | string): Promise<Session>;
    setSessionForUserId(id: number | string, state: Session): Promise<boolean>;
    deleteSessionForUserId(id: number | string): Promise<boolean>;
}
