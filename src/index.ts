require("dotenv").config();
import EntryBot from "@/entrybot";

const bot = new EntryBot(process.env.BOT_USERNAME!, process.env.BOT_PASSWORD!, {
  cookieStorePath: "./cookie.json",
});

bot.on("login", (credentials) => console.log(`${credentials.user.username}으로 로그인했습니다`));

bot.on("post", (post) => {
  console.log(post.id, post.user.nickname, post.content);
});

bot.login().then(() => bot.listenPosts());
