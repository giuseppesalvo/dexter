import { Bot        } from '../bot' 
import { Message    } from '../message'
import { User    	} from '../user'
import { BasePlugin } from './base'
import { Plugin     } from './index'

export interface ReactorSettings {
	name: string
	trigger: string|RegExp
}

export interface ReactorCtx {
	plugin  : ReactorPlugin
	bot     : Bot
	message?: Message
	sender? : User
}

export enum ReactorEvent {
	Init = "init",
	Text = "text"
}

export class ReactorPlugin extends BasePlugin implements Plugin {

	constructor(
		public settings: ReactorSettings,
	) {
		super()
	}

	resolveOnInit(bot: Bot) {
		this.emit( ReactorEvent.Init , {
			bot: bot,
			plugin: this,
		} as ReactorCtx)

		return Promise.resolve()
	}

	run(bot: Bot, message: Message) {
		this.emit( ReactorEvent.Text, {
			bot: bot,
			message: message,
			plugin: this,
			sender: message.sender,
		} as ReactorCtx)
	}

	resolveOnText(bot: Bot, msg: Message) {
		const triggered = this.checkTrigger(this.settings.trigger, msg.text)
		if ( triggered ) {
			this.run(bot, msg)
		}

		return Promise.resolve()
	}
}