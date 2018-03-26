"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * In memory storage with map[string]*Session
 * Default bot storage
 */
class MapPluginStorage {
    constructor() {
        this.sessions = {};
    }
    getSessionByUserId(id) {
        return Promise.resolve(this.sessions[id]);
    }
    setSessionForUserId(id, state) {
        this.sessions[id] = state;
        return Promise.resolve(true);
    }
    deleteSessionForUserId(id) {
        delete this.sessions[id];
        return Promise.resolve(true);
    }
}
exports.MapPluginStorage = MapPluginStorage;
//# sourceMappingURL=storage.js.map