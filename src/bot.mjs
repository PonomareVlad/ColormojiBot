import {parseCommands, NewMethodsMixin} from "telebot-utils";
import {circle} from "./svg.mjs";
import TeleBot from "telebot";

const {TELEGRAM_BOT_TOKEN} = process.env;

class ColormojiBot extends NewMethodsMixin(TeleBot) {
    constructor(...args) {
        super(...args);
        this.mod("message", parseCommands);
        this.on("text", this.text.bind(this));
    }

    async text(message = {}) {
        const {isCommand, text, from: {id} = {}, reply = {}} = message || {};
        if (isCommand) return this.command(message);
        return reply.text(circle(text));
    }

    async command(message = {}) {
        const {command, text, from: {id} = {}, reply = {}} = message || {};
        switch (command) {
            default:
                return reply.text("Send any color in HEX to make Emoji");
        }
    }
}

export default new ColormojiBot(TELEGRAM_BOT_TOKEN);
