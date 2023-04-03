import {parseCommands, NewMethodsMixin} from "telebot-utils";
import {circle, convert} from "./svg.mjs";
import TeleBot from "telebot";

const {API_URL, TELEGRAM_BOT_TOKEN} = process.env;

class ColormojiBot extends NewMethodsMixin(TeleBot) {
    constructor(...args) {
        super(...args);
        this.mod("message", parseCommands);
        this.on("text", this.text.bind(this));
    }

    async text(message = {}) {
        try {
            const {isCommand, text, from: {id} = {}, reply = {}} = message || {};
            if (isCommand) return this.command(message);
            const sticker = await convert(circle(text));
            const options = {fileName: "sticker.tgs", asReply: true};
            await reply.file(sticker, options);
        } catch (e) {
            console.error(e);
        }
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
