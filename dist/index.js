"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const entrybot_1 = __importDefault(require("@/entrybot"));
const tough_cookie_1 = require("tough-cookie");
const tough_cookie_file_store_1 = require("tough-cookie-file-store");
require("./config");
const bot = new entrybot_1.default(process.env.BOT_USERNAME, process.env.BOT_PASSWORD, new tough_cookie_1.CookieJar(new tough_cookie_file_store_1.FileCookieStore("./cookie.json")), { maxRepliesBeforeCooldown: 3 });
bot.once("ready", (credentials) => console.log(`${credentials.user.username}으로 로그인했습니다`));
bot.on("post", (post) => {
    const prefix = ">";
    if (!post.content.startsWith(prefix))
        return;
    const args = post.content.split(" ");
    const cmd = args.shift()?.slice(prefix.length);
    if (cmd === "test") {
        post.reply(`님아 ${args[0]} 하지마세요`, { sticker: "63c7948a7b5371bb348923fe" });
    }
});
bot.listen();
