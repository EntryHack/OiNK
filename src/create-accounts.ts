import { existsSync, readFileSync, writeFileSync } from "fs";
import { createInterface } from "readline/promises";
import { CookieJar } from "tough-cookie";
import EntryBot from "@/entrybot";
import { CHANGE_USER_EMAIL, CHECK_WORD, SIGNUP_BY_USERNAME } from "@/queries/user";
import "@/config";

const cookieJar = new CookieJar();
const bot = new EntryBot(process.env.BOT_USERNAME!, process.env.BOT_PASSWORD!, cookieJar);
const rl = createInterface({ input: process.stdin, output: process.stdout });

const randomString = (length: number) => {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;

  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }

  return result;
};

const main = async () => {
  const path = process.env.SUB_BOT_SAVE_FILE ?? "./accounts.json";
  const count = parseInt(await rl.question("COUNT: "));

  const accounts: { username: string; password: string }[] = existsSync(path)
    ? JSON.parse(readFileSync(path, "utf-8"))
    : (() => {
        writeFileSync(path, "[]", "utf-8");
        return [];
      })();

  const [emails, xsrfToken] = await new Promise<[string[], string]>((resolve) => {
    bot.fetch("https://www.emailnator.com").then(() => {
      const xsrfToken = decodeURIComponent(
        cookieJar.getCookiesSync("https://www.emailnator.com").find((cookie) => cookie.key === "XSRF-TOKEN")!.value
      );

      bot
        .fetch("https://www.emailnator.com/generate-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-xsrf-token": xsrfToken,
          },
          body: JSON.stringify({ email: ["dotGmail"], emailNo: count.toString() }),
        })
        .then((res) => res.json())
        .then((data) => resolve([data.email, xsrfToken]));
    });
  });

  const loop = async (i: number): Promise<void> => {
    const username = `${process.env.SUB_BOT_USERNAME_PREFIX}${randomString(
      20 - process.env.SUB_BOT_USERNAME_PREFIX!.length
    )}`;
    const nickname = `${process.env.SUB_BOT_NICKNAME_PREFIX}${randomString(
      12 - process.env.SUB_BOT_NICKNAME_PREFIX!.length
    )}`;
    const email = emails[i];
    const password = process.env.SUB_BOT_PASSWORD ?? "";

    const newBot = new EntryBot(username, password, cookieJar.cloneSync());

    await newBot.fetch("https://playentry.org/signup/1");
    await newBot.fetch("https://playentry.org/signup/2");
    await newBot.fetch("https://playentry.org/signup/3");

    await newBot.gql(CHECK_WORD, { type: "user", word: username });
    await newBot.gql(CHECK_WORD, { type: "user", word: nickname });

    const signupRes = await newBot.gql(SIGNUP_BY_USERNAME, {
      username,
      nickname,
      password,
      passwordConfirm: password,
      email,
      role: "member",
      gender: "male",
      grade: "11",
      mobileKey: "",
    });

    if (!signupRes.success) return await loop(i);

    // console.log(`CREATED: ${username}`);

    const changeEmailRes = await newBot.gql(CHANGE_USER_EMAIL, { email });
    if (!changeEmailRes.success) return await loop(i);

    const verifyUrls = await new Promise<string[]>((res) => {
      const interval = setInterval(async () => {
        try {
          const messageListRes = await newBot.fetch("https://www.emailnator.com/message-list", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-xsrf-token": xsrfToken,
            },
            body: JSON.stringify({ email }),
          });
          // const { messageData: messageList }: { messageData: { from: string; messageID: string }[] } =
          const tmp = await messageListRes.text();
          if (!tmp.startsWith("{")) console.log(tmp);
          //   await messageListRes.json();
          const { messageData: messageList }: { messageData: { from: string; messageID: string }[] } = JSON.parse(tmp);
          const verifyEmails = messageList.filter((message) => message.from.includes("noreply@playentry.org"));

          if (verifyEmails.length >= 2) {
            clearInterval(interval);

            const urls: string[] = [];
            verifyEmails.forEach(async (verifyEmail) => {
              const emailBodyRes = await newBot.fetch("https://www.emailnator.com/message-list", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "x-xsrf-token": xsrfToken,
                },
                body: JSON.stringify({ email, messageID: verifyEmail.messageID }),
              });
              const emailBody = await emailBodyRes.text();

              const url = /\<a href="(https:\/\/playentry.org\/api\/email\/.*?)"/.exec(emailBody)![1];
              urls.push(url);

              if (urls.length >= 2) res(urls);
            });
          }
        } catch (_) {}
      }, 1000);
    });

    await Promise.all(verifyUrls.map((url) => bot.fetch(url)));

    console.log(`VERIFIED: ${username}`);

    accounts.push({ username, password });
  };

  await Promise.all(Array.from(new Array(count), (_, i) => loop(i)));

  writeFileSync(path, JSON.stringify(accounts));
  console.log(`SAVED TO: ${path}`);

  process.exit(0);
};

bot.on("ready", () => main());

bot.listen();
