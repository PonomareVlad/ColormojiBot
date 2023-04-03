import {parseCommands, NewMethodsMixin, getSetName} from "telebot-utils";
import {serializeError} from "serialize-error";
import {shapes, convert} from "./svg.mjs";
import {md} from "telegram-md";
import TeleBot from "telebot";

const {TELEGRAM_BOT_TOKEN} = process.env;

class ColormojiBot extends NewMethodsMixin(TeleBot) {
    constructor(...args) {
        super(...args);
        this.mod("message", parseCommands);
        this.on("text", this.text.bind(this));
        this.on("callbackQuery", this.callback.bind(this));
    }

    async text(message = {}) {
        const {
            isCommand,
            reply = {}
        } = message || {};
        if (isCommand) return this.command(message);
        const text = `Select shape for new emoji:`;
        const buttons = Object.keys(shapes).map(callback => this.inlineButton(callback, {callback}));
        const replyMarkup = this.inlineKeyboard([buttons]);
        return reply.text(text, {asReply: true, replyMarkup});
    }

    async callback({id, message, data} = {}) {
        if (!(data in shapes)) return this.answerCallbackQuery(id, {text: "Wrong shape !"});
        const {
            message_id: messageId,
            chat: {
                id: chatId
            } = {},
            reply_to_message: {
                text: color,
                from: {
                    id: user_id
                } = {}
            } = {}
        } = message;
        try {
            await this.answerCallbackQuery(id, {text: "Uploading emoji..."});
            const username = this.username ??= await this.get("username");
            const set = {
                user_id,
                title: `@${username}`,
                name: getSetName(String(user_id), username)
            };
            const buffer = await convert(shapes[data](color));
            const {file_id} = await this.uploadStickerFile({...set, buffer});
            const sticker = {
                sticker: file_id,
                emoji_list: ["🌈"]
            };
            const {name} = await this.getStickerSet(set).catch(e => e);
            if (!name) await this.createNewStickerSet({...set, stickers: [sticker]});
            await this.addStickerToSet({...set, sticker});
            const text = `Emoji added to your set: t.me/addemoji/${set.name}`;
            await this.editMessageText({chatId, messageId}, text);
            await this.sendDocument(chatId, file_id, {fileName: "sticker.tgs"});
        } catch (error) {
            const json = JSON.stringify(serializeError(error), null, 2);
            const message = md.build(md.codeBlock(json, "json"));
            return await this.editMessageText({chatId, messageId}, message, {parseMode: "MarkdownV2"});
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
