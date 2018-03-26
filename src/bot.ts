import * as Telegraf from 'telegraf'
import * as Readline from 'readline'

import { Message } from './message'
import { Plugin  } from './plugin'
import { User    } from './user'

export enum Mode {
	Telegram = 1,
	Debug
}

export interface Settings {
	token: string
	mode: Mode
	plugins?: Plugin[]
}

export class Bot {

	plugins: Plugin[] = []
	telegraf: any

	// If you put public or private before a constructor argument,
	// it will be added to the class scope, so, you can find it with this.yourargumentname
	// in this case -> this.settings
	constructor(
		public settings: Settings
	) {
		
		this.plugins = this.settings.plugins || []

	}

	public start() {

		if ( this.settings.mode === Mode.Telegram )
			return this.startTelegram()

		if ( this.settings.mode === Mode.Debug )
			return this.startDebug()

		console.log('Invalid bot mode')
	}

	async startDebug() {
		
		const rl = Readline.createInterface({
		  input: process.stdin,
		  output: process.stdout,
		  terminal: true,
		  prompt: "→ ",
		});

		await this.pluginsOnInit()

		rl.prompt()
		
		rl.on('line', async (line:string) => {

			let text = line
			let user_id = "telegram_user"

			if ( /[A-Z]{2,2}:\s.+/.test(line) ) {
				user_id = line.substr(0,2)
				text    = line.substr(4)
			}

			const user: User = {
				id:   user_id,
				name: user_id,
				telegram: null,
			}

			const msg: Message = {
				id: Date.now(),
				text: text,
				sender: user,
			}

			await this.pluginsOnText(msg)
			
			rl.prompt()
		})
	}

	private startTelegram() {

		const tl = new Telegraf(this.settings.token)

		this.telegraf = tl
		
		tl.start((ctx:any) => {
			this.pluginsOnInit()
		})

		tl.on('message', (ctx:any) => {

			const user: User = {
				id:   ctx.message.from.id,
				name: ctx.message.from.name,
				telegram: ctx.message.from,
			}

			const msg: Message = {
				id: ctx.message.id,
				text: ctx.message.text,
				sender: user,
				telegram: ctx.message,
			}

			this.pluginsOnText(msg)
		})
		
		tl.startPolling()
	}

	private arePluginsOk() {
		return this.plugins && this.plugins.length > 0
	}

	private pluginsOnInit() {
		if ( ! this.arePluginsOk() ) return

		return Promise.all(this.plugins.map(plugin => {
			return plugin.resolveOnInit(this)
		}))
	}

	private pluginsOnText(msg: Message) {
		if ( ! this.arePluginsOk() ) return

		return Promise.all(this.plugins.map(plugin => {
			return plugin.resolveOnText(this, msg)
		}))
	}

	sendMessage(msg: string, sender: User, options:any|null = null) {
		
		if ( this.settings.mode === Mode.Debug ) {
			
			console.log("🤖: " + msg)
		
			if ( options ) {

				if ( options.reply_markup ) {
					const keyboard = options.reply_markup.keyboard.map((v:any) => {
						return "[" + v.join(", ") + "]"
					}).join("\n")

					console.log(keyboard)
				}

			}

	
		} else if ( this.settings.mode === Mode.Telegram ) {

			if ( options ) {
				this.telegraf.telegram.sendMessage(sender.id, msg, options)
			} else {
				this.telegraf.telegram.sendMessage(sender.id, msg, {
					reply_markup: {
						remove_keyboard: true
					}
				})
			}

		}
	}
	
}