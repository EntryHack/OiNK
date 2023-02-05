import { CookieJar } from "tough-cookie";
import { FileCookieStore } from "tough-cookie-file-store";
import EntryBot from "@/entrybot";
import "@/config";

const bot = new EntryBot(
  process.env.BOT_USERNAME!,
  process.env.BOT_PASSWORD!,
  new CookieJar(new FileCookieStore("./cookie.json")),
  { maxRepliesBeforeCooldown: 3 }
);

bot.once("ready", (credentials) => console.log(`${credentials.user.username}으로 로그인했습니다`));

bot.on("post", (post) => {
  const prefix = ">";
  if (!post.content.startsWith(prefix)) return;

  const args = post.content.split(" ");
  const cmd = args.shift()?.slice(prefix.length);

  if (cmd === "test") {
    post.reply(`님아 ${args[0]} 하지마세요`, { sticker: "63c7948a7b5371bb348923fe" });
  }
});

bot.listen();
