import { Session } from "./session"

/**
 * Customizable PluginStorage for retrieving user sessions in conversational plugins
 */

export interface Storage {
	getSessionByUserId(id: number|string): Promise<Session>
	setSessionByUserId(id: number|string, state: Session): Promise<boolean>
	deleteSessionByUserId(id: number|string): Promise<boolean>
}

/**
 * In memory storage with map[string]*Session
 * Default bot storage
 */

export class MapPluginStorage implements Storage {
	
	public sessions:any = {}

	getSessionByUserId(id: number|string): Promise<Session> {
		return Promise.resolve(this.sessions[id])
	}
	
	setSessionByUserId(id: number|string, state: Session): Promise<boolean> {
		this.sessions[id] = state
		return Promise.resolve(true)
	}
	
	deleteSessionByUserId(id: number|string): Promise<boolean> {
		delete this.sessions[id]
		return Promise.resolve(true)
	}

}
