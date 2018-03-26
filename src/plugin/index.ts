import { Bot        } from '../bot' 
import { Message    } from '../message'

export interface Plugin {
	resolveOnInit(bot: Bot):Promise<any>
	resolveOnText(bot: Bot, msg: Message):Promise<any>
}