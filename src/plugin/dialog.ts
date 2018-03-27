import { Bot        } from '../bot' 
import { Message    } from '../message'
import { User 		} from '../user'
import { BasePlugin } from './base'
import { Plugin     } from './index'
import { Session    } from './session'  
import {
	Storage,
	MapPluginStorage
} from './storage'

export type StateFn = (ctx: DialogCtx) => void 

export interface DialogSettings {
	name: string
	trigger: string|RegExp
	states: StateFn[]
	storage?: Storage
	remindEvery: number
	expireAfter: number
}

export interface DialogCtx {
	bot    : Bot
	plugin : DialogPlugin
	sender? : User
	message?: Message
	session?: Session
}

export enum DialogEvent {
	Init = "init",
	SessionEnd = "session_end",
	SessionExpired = "session_expired",
	SessionRemind = "session_remind",
	SessionStart = "session_start",
	Text = "text"
}

export class DialogPlugin extends BasePlugin implements Plugin {

	private storage: Storage

	constructor(
		public settings: DialogSettings,
	) {
		super()
		this.storage = this.settings.storage || new MapPluginStorage()
	}

	resolveOnInit(bot: Bot) {
		this.emit( DialogEvent.Init , {
			bot: bot,
			plugin: this,
		})
		return Promise.resolve()
	}

	async resolveOnText(bot: Bot, msg: Message) {
		const isRunning = await this.isSessionRunningForUser(msg.sender.id)
		if ( this.checkTrigger(this.settings.trigger, msg.text) || isRunning ) {
			return this.run(bot, msg)
		}
		return Promise.resolve()
	}

	run(bot: Bot, msg: Message) {

		console.log('running')

		return Promise.all([
			
			this.getSessionByUserId(msg.sender.id),
			this.isSessionRunningForUser(msg.sender.id),

		]).then(async args => {

			const session   = args[0] as Session
			const isRunning = args[1] as boolean

			this.setRemindIntervalToSession(session, bot, msg.sender)
			this.setExpireTimeoutToSession(session, bot, msg.sender)
	
			if ( !isRunning ) {
				return this.startSession(bot, msg.sender)
			} else {
				this.sendQuestionForSession(session, bot, msg.sender, msg)
				return Promise.resolve()
			}
		
		})
	}

	runSessionForUserId( bot:Bot, id:string|number ): Promise<any> {

		return Promise.all([
				
			bot.getChatInfo(id),
			this.getSessionByUserId(id),
			this.isSessionRunningForUser(id),

		]).then(async args => {

			const user 		= args[0] as User
			const session   = args[1] as Session
			const isRunning = args[2] as boolean

			this.setRemindIntervalToSession(session, bot, user)
			this.setExpireTimeoutToSession(session, bot, user)
	
			if ( !isRunning ) {
				return this.startSession(bot, user)
			} else {
				console.log('session is already running')
				return Promise.resolve()
			}
		
		})
	}

	/**
	 * Session Methods
	 *
	 */

	async repeatSessionFromCtx( ctx: DialogCtx ) {
		const session = await this.getSessionByUserId(ctx.sender.id)
		this.sendQuestionForSession(session, ctx.bot, ctx.sender, ctx.message)
	}

	private async startSession(bot: Bot, user: User) {
		const session = await this.getSessionByUserId(user.id)
		session.running = true

		this.emit( DialogEvent.SessionStart, {
			plugin: this,
			bot: bot,
			sender: user,
			session: session,
		} as DialogCtx)

		this.sendQuestionForSession(session, bot, user)
		return session
	}

	endSession(bot: Bot, user: User, session: Session) {

		this.clearRemindIntervalToSession(session, bot)
		this.clearExpireTimeoutToSession(session, bot)

		this.emit( DialogEvent.SessionEnd, {
			plugin: this,
			bot: bot,
			sender: user,
			session: session,
		} as DialogCtx)

		this.storage.deleteSessionByUserId(user.id)
	}

	private async getSessionByUserId(id: string|number): Promise<Session> {
		const session = await this.storage.getSessionByUserId(id)

		if ( session ) {
			return session
		} else {
			const session = new Session(id)
			await this.storage.setSessionByUserId(id, session)
			return session
		}
	}

	private async isSessionRunningForUser(id: string|number): Promise<boolean> {
		const session = await this.storage.getSessionByUserId(id)
		return !!session && session.running
	}

	private sendQuestionForSession(session: Session, bot: Bot, user: User, msg: Message|null = null) {
		const state = this.settings.states[session.stateIndex]
		
		const ctx = {
			plugin: this,
			bot: bot,
			sender: user,
			session: session,
			message: msg,
		} as DialogCtx

		state(ctx)
		
		this.emit( DialogEvent.Text, ctx )
	}

	/**
	 * Timeout methods
	 *
	 */

	private clearExpireTimeoutToSession( session: Session, bot: Bot ) {
		clearTimeout(session.expireTimeout)
	}

	private setExpireTimeoutToSession( session: Session, bot: Bot, user: User ) {
		if ( this.settings.expireAfter > 0 ) {

			this.clearExpireTimeoutToSession(session, bot)

			session.expireTimeout = setTimeout(() => {

				this.clearRemindIntervalToSession(session, bot)

				this.emit( DialogEvent.SessionExpired, {
					plugin: this,
					bot: bot,
					session: session,
					sender: user,
				} as DialogCtx)

				this.storage.deleteSessionByUserId(session.userId)

			}, this.settings.expireAfter)
		}
	} 

	/**
	 * Interval methods
	 *
	 */

	private clearRemindIntervalToSession( session: Session, bot: Bot ) {
		clearInterval(session.remindInterval)
	}

	private setRemindIntervalToSession( session: Session, bot: Bot, user: User ) {
		if ( this.settings.remindEvery > 0 ) {

			this.clearRemindIntervalToSession(session, bot)

			session.remindInterval = setInterval(() => {

				this.emit( DialogEvent.SessionRemind , {
					plugin: this,
					bot: bot,
					session: session,
					sender: user,
				} as DialogCtx)

			}, this.settings.remindEvery)
		}
	}
}