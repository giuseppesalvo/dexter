"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Session {
    constructor(UserId) {
        this.userId = UserId;
        this.stateIndex = 0;
        this.createdAt = Date.now();
        this.cronology = [];
        this.running = false;
    }
    end(ctx) {
        ctx.plugin.endSession(ctx.bot, ctx.message, this);
    }
    goBack(ctx) {
        this.stateIndex -= 1;
        ctx.plugin.run(ctx.bot, ctx.message);
    }
    error(ctx) {
        // do nothing for now
    }
    stayHere(ctx) {
        // do nothing for now
    }
    goTo(ctx, index) {
        this.stateIndex = index;
        ctx.plugin.run(ctx.bot, ctx.message);
    }
    goToStart(ctx) {
        this.goTo(ctx, 0);
    }
    waitForAnswer(ctx) {
        this.stateIndex += 1;
    }
    waitForAnswerAndGoTo(ctx, index) {
        this.stateIndex = index;
    }
    skipToNext(ctx) {
        this.stateIndex += 1;
        ctx.plugin.run(ctx.bot, ctx.message);
    }
}
exports.Session = Session;
//# sourceMappingURL=session.js.map