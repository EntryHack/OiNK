require("dotenv").config();
import EntryBot from "@/entrybot";

const bot = new EntryBot(process.env.BOT_USERNAME!, process.env.BOT_PASSWORD!, {
  fileCookieStorePath: "./cookie.json",
});

bot.on("login", (credentials) => {
  console.log(credentials, new Date(credentials.updated).toLocaleTimeString());
});

bot.login();
