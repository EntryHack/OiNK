import { createInterface } from "readline/promises";
import EntryBot from "@/entrybot";
import { CHANGE_USER_EMAIL, CHECK_WORD, SIGNUP_BY_USERNAME, USER_EXITS } from "@/queries/user";
import "@/config";
import { existsSync, readFileSync, writeFileSync } from "fs";

const bot = new EntryBot(process.env.BOT_USERNAME!, process.env.BOT_PASSWORD!, {});
const rl = createInterface({ input: process.stdin, output: process.stdout });

const main = async () => {
  const path = process.env.SUB_BOT_SAVE_FILE ?? "./accounts.json";
  const count = parseInt(await rl.question("생성할 계정의 개수: "));

  const accounts: { username: string; password: string }[] = existsSync(path)
    ? JSON.parse(readFileSync(path, "utf-8"))
    : (() => {
        writeFileSync(path, "[]", "utf-8");
        console.log(`${path} 파일을 생성했습니다`);
        return [];
      })();

  const loop = async (i: number) => {
    const username = `${process.env.SUB_BOT_USERNAME_PREFIX}${i}`;
    const nickname = `${process.env.SUB_BOT_NICKNAME_PREFIX}${i}`;
    const email = `${process.env.SUB_BOT_EMAIL_PREFIX}${i}@${process.env.SUB_BOT_EMAIL_DOMAIN}`;
    const password = process.env.SUB_BOT_PASSWORD ?? "";

    await bot.fetch("https://playentry.org/signup/1");
    await bot.fetch("https://playentry.org/signup/2");
    await bot.fetch("https://playentry.org/signup/3");

    await bot.gql(CHECK_WORD, { type: "user", word: username });
    await bot.gql(CHECK_WORD, { type: "user", word: nickname });

    const signupRes = await bot.gql(SIGNUP_BY_USERNAME, {
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

    if (!signupRes.success) return console.error(`${username} 계정 생성을 실패했습니다`);

    console.log(`${username} 계정 생성을 성공했습니다`);

    const changeEmailRes = await bot.gql(CHANGE_USER_EMAIL, { email });
    if (!changeEmailRes) return console.error(`${username} 계정 이메일 발송을 실패했습니다`);

    const verifyUrl = await rl.question("이메일 인증 링크");
    await bot.fetch(verifyUrl);

    console.log(`${username} 계정 이메일 발송을 성공했습니다`);

    return accounts.push({ username, password });
  };

  const existingAccounts = accounts.filter((account) =>
    account.username.startsWith(process.env.SUB_BOT_USERNAME_PREFIX!)
  );
  const biggestExistingAccountIndex = existingAccounts
    .map((account) => parseInt(account.username.slice(process.env.SUB_BOT_USERNAME_PREFIX!.length)))
    .sort((a, b) => b - a)[0];

  for (let i = existingAccounts.length > 0 ? biggestExistingAccountIndex : 0; i < count; i++) {
    await loop(i + 1);
  }

  writeFileSync(path, JSON.stringify(accounts));
  console.log(`생성한 계정들을 ${path}에 저장했습니다`);
};

main();
