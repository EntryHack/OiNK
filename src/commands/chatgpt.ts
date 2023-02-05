import { ChatGPTAPI } from "chatgpt";
import { QuickDB } from "quick.db";
import { Command } from "@/command-handler";

const db = new QuickDB({ table: "chatgpt" });

const api = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface Conversation {
  conversationId: string | undefined;
  parentMessageId: string | undefined;
}

export default Command(async (post, args) => {
  const [waitReply] = await Promise.all([
    post.reply("대답을 작성하고 있어요! 조금만 기다려주세요.", { sticker: "63dfad9d13799dadb32e3e12" }),
    (async () => {
      if (!(await db.has("conversations"))) await db.set("conversations", {});

      let conservations = await db.get<Conversation>(`conversations.${post.user.id}`);
      if (!conservations) {
        const tmp = await api.sendMessage(
          `Hello! My username is "${post.user.username}", and my nickname is "${post.user.nickname}"`
        );
        conservations = { conversationId: tmp.conversationId, parentMessageId: tmp.id };
      }
      const res = await api.sendMessage(args.join(" "), conservations ?? {});

      console.log(`\n${post.user.nickname}: ${args.join(" ")}\nChatGPT: ${res.text}\n`);

      await Promise.all([
        db.set(`conversations.${post.user.id}`, { conversationId: res.conversationId, parentMessageId: res.id }),
        post.reply(res.text),
      ]);
    })(),
  ]);
  if (!waitReply.success) return;

  waitReply.data.remove();
});
