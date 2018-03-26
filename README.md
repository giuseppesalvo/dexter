# WORK IN PROGRESS

# HOW TO

## Dependencies
- Typescript: $ npm i -g typescript
- NodeJS 8.6.0

## Commands
- $ yarn watch
- $ yarn start

### Bot init

```javascript
import {
	Bot, Mode
} from 'dexter.js'

const bot = new Bot({
	token: Config.telegramToken,
	mode: Mode.Debug,
	plugins: [ MyPlugin, AnotherPlugin ]
})

bot.start()
```

### Reactor

```javascript
import {
	ReactorPlugin,
	ReactorCtx,
	ReactorEvent,
} from 'dexter.js'

export const Hello: any = new ReactorPlugin({
	name: "hello",
	trigger: "hello",
})

Hello.on( ReactorEvent.Text, (ctx: ReactorCtx) => {
	ctx.bot.sendMessage("hello man!", ctx.sender)
})

Hello.on( ReactorEvent.Init, (ctx: ReactorCtx) => {
	console.log("Init in hello")
})
```


### Dialog

```javascript
import {
	DialogPlugin,
	DialogEvent,
	DialogCtx
} from 'dexter.js'

const States = [
	
	function (ctx: DialogCtx) {
		ctx.bot.sendMessage('What color do you like?', ctx.sender)
		ctx.session.waitForAnswer(ctx)
	},

	function (ctx: DialogCtx) {
		ctx.bot.sendMessage('Are you sure? (yes, no)', ctx.sender)
		ctx.session.waitForAnswer(ctx)
	},

	function (ctx: DialogCtx) {

		if ( ctx.message.text === "yes" ) {
			ctx.bot.sendMessage('Ok!', ctx.sender)
			ctx.session.end(ctx)
			return
		}

		if ( ctx.message.text === "no" ) {
			ctx.session.goToStart(ctx)
			return
		}	

		ctx.bot.sendMessage('Permitted answers: (yes, no)', ctx.sender)
		ctx.session.error(ctx)
	},

]

export const Color: any = new DialogPlugin({
	name: "color",
	trigger: "/color",
	states: States,
	remindEvery: 3 * 1000,
	expireAfter: 20 * 1000,
})

Color.on( DialogEvent.SessionRemind, (ctx:DialogCtx) => {
	ctx.plugin.repeatSessionFromCtx(ctx)
})

Color.on( DialogEvent.SessionExpired, (ctx:DialogCtx) => {
	ctx.bot.sendMessage("bye man", ctx.sender)
})
```