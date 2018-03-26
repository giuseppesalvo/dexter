import * as EventEmitter from 'events'
import { Middleware }   from './middleware'

export class BasePlugin extends EventEmitter {

	checkTrigger(trigger:string|RegExp, text:string):boolean {
		if ( trigger instanceof RegExp ) {
			return trigger.test(text)
		} else if ( typeof trigger === "string" ) {
			return text === trigger
		} else {
			return false
		}
	}
	
	/*
	public middlewares: PluginMiddleware[]

	constructor() {
		this.middlewares = []
	}

	use(middleware: PluginMiddleware) {
		this.middlewares.push(middleware)
	}

	resolveMiddlewaresOnInit() {
		this.middlewares.forEach()
	}
	*/
}