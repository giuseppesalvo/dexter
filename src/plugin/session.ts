import { Message   } from "../message"
import { DialogCtx } from './dialog'

export class Session {
	
	public userId         : number|string
	public stateIndex     : number
	public createdAt      : number
	public cronology 	  : Message[]
	public remindInterval : NodeJS.Timer
	public expireTimeout  : NodeJS.Timer
	public data 		  : any
	public running    	  : boolean

	constructor( UserId: number|string ) {
		this.userId = UserId

		this.stateIndex = 0
		this.createdAt  = Date.now()
		this.cronology  = []
		this.running    = false
	}

	end( ctx: DialogCtx ) {
		ctx.plugin.endSession(ctx.bot, ctx.sender, this)
	}

	goBack( ctx: DialogCtx ) {
		this.stateIndex -= 1
		ctx.plugin.run(ctx.bot, ctx.message)
	}

	error( ctx: DialogCtx ) {
		// do nothing for now
	}

	stayHere( ctx: DialogCtx ) {
		// do nothing for now
	}

	goTo( ctx: DialogCtx, index: number ) {
		this.stateIndex = index
		ctx.plugin.run(ctx.bot, ctx.message)
	}

	goToStart( ctx: DialogCtx ) {
		this.goTo(ctx, 0)
	}

	waitForAnswer( ctx: DialogCtx ) {
		this.stateIndex += 1
	}

	waitForAnswerAndGoTo( ctx: DialogCtx, index: number ) {
		this.stateIndex = index
	}

	skipToNext( ctx: DialogCtx ) {
		this.stateIndex += 1
		ctx.plugin.run(ctx.bot, ctx.message)
	}

}