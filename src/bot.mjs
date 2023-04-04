import {parseCommands, NewMethodsMixin, getSetName, keyboardGrid} from "telebot-utils";
import {serializeError} from "serialize-error";
import {shapes, convert} from "./svg.mjs";
import {md} from "telegram-md";
import TeleBot from "telebot";

const {TELEGRAM_BOT_TOKEN} = process.env;

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

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
        const text = `Select shape and size for new emoji:`;
        const buttons = Object.keys(shapes).map(callback => this.inlineButton(capitalize(callback), {callback}));
        const replyMarkup = this.inlineKeyboard(keyboardGrid(buttons, 3));
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
                from = {}
            } = {}
        } = message;
        try {
            await this.answerCallbackQuery(id, {text: "Uploading emoji..."});
            const username = from.username ? `@${from.username}` : `id${from.id}`;
            this.username ??= await this.get("username");
            const set = {
                user_id: from.id,
                name: `id${from.id}`,
                title: `@${this.username}`
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
            const text = `Emoji added to your set: t.me/addemoji/${getSetName(set.name, this.username)}`;
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
