import {parseCommands, NewMethodsMixin} from "telebot-utils";
import {circle} from "./svg.mjs";
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
            const body = new FormData();
            body.append("file", new Blob([circle(text)]), "sticker.svg");
            const response = await fetch(API_URL, {body, method: "POST"});
            const sticker = await response.arrayBuffer();
            await reply.file(Buffer.from(sticker), {
                fileName: "sticker.tgs",
                asReply: true,
            });
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
