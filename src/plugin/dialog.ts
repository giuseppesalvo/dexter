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
		const isRunning = await this.isSessionRunningForUser(msg.sender)
		if ( this.checkTrigger(this.settings.trigger, msg.text) || isRunning ) {
			return this.run(bot, msg)
		}
		return Promise.resolve()
	}

	run(bot: Bot, msg: Message) {

		return Promise.all([
			
			this.getSession(msg.sender),
			this.isSessionRunningForUser(msg.sender),

		]).then(async args => {

			const session   = args[0] as Session
			const isRunning = args[1] as boolean

			this.setRemindIntervalToSession(session, bot)
			this.setExpireTimeoutToSession(session, bot)
	
			if ( !isRunning ) {
				return this.startSession(bot, msg)
			} else {
				this.sendQuestionForSession(session, bot, msg)
				return Promise.resolve()
			}
		})
	}

	/**
	 * Session Methods
	 *
	 */

	async repeatSessionFromCtx( ctx: DialogCtx ) {
		const session = await this.getSession(ctx.sender)
		this.sendQuestionForSession(session, ctx.bot, ctx.message)
	}

	private async startSession(bot: Bot, msg: Message) {
		const session = await this.getSession(msg.sender)
		session.running = true

		this.emit( DialogEvent.SessionStart, {
			plugin: this,
			bot: bot,
			sender: msg.sender,
			message: msg,
			session: session,
		} as DialogCtx)

		this.sendQuestionForSession(session, bot, msg)
		return session
	}

	endSession(bot: Bot, msg: Message, session: Session) {

		this.clearRemindIntervalToSession(session, bot)
		this.clearExpireTimeoutToSession(session, bot)

		this.emit( DialogEvent.SessionEnd, {
			plugin: this,
			bot: bot,
			sender: msg.sender,
			message: msg,
			session: session,
		} as DialogCtx)

		this.storage.deleteSessionForUserId(msg.sender.id)
	}

	private async getSession(user: User): Promise<Session> {
		const session = await this.storage.getSessionByUserId(user.id)

		if ( session ) {
			return session
		} else {
			const session = new Session(user.id)
			await this.storage.setSessionForUserId(user.id, session)
			return session
		}
	}

	private async isSessionRunningForUser(user: User): Promise<boolean> {
		const session = await this.storage.getSessionByUserId(user.id)
		return !!session && session.running
	}

	private sendQuestionForSession(session: Session, bot: Bot, msg: Message) {
		const state = this.settings.states[session.stateIndex]
		
		const ctx = {
			plugin: this,
			bot: bot,
			sender: msg.sender,
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

	private setExpireTimeoutToSession( session: Session, bot: Bot ) {
		if ( this.settings.expireAfter > 0 ) {

			this.clearExpireTimeoutToSession(session, bot)

			session.expireTimeout = setTimeout(() => {

				this.clearRemindIntervalToSession(session, bot)

				this.emit( DialogEvent.SessionExpired, {
					plugin: this,
					bot: bot,
					session: session,
				} as DialogCtx)

				this.storage.deleteSessionForUserId(session.userId)

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

	private setRemindIntervalToSession( session: Session, bot: Bot ) {
		if ( this.settings.remindEvery > 0 ) {

			this.clearRemindIntervalToSession(session, bot)

			session.remindInterval = setInterval(() => {

				this.emit( DialogEvent.SessionRemind , {
					plugin: this,
					bot: bot,
					session: session,
				} as DialogCtx)

			}, this.settings.remindEvery)
		}
	}
}