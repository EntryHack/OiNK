import EntryBot from "./entrybot";
import { CREATE_COMMENT } from "./queries/community";
import type { MinimalImage } from "./queries/common.d";
import type { CreateComment, CreateCommentVariables, MinimalDiscuss } from "./queries/community.d";
import type { ResponseFail, ResponseSuccess } from "./types";
import accounts from "../accounts.json";
import { CookieJar } from "tough-cookie";
import Comment from "./comment";

class Post implements MinimalDiscuss {
  id: string;
  content: string;
  created: string;
  category: string;
  user: {
    id: string;
    username: string;
    nickname: string;
    profileImage: MinimalImage;
    coverImage: MinimalImage;
    status: { following: number; follower: number };
    description: string;
    role: "member" | "teacher" | "student" | "admin";
  };
  image: MinimalImage;
  sticker: MinimalImage;
  bot: EntryBot;

  constructor(post: MinimalDiscuss, bot: EntryBot) {
    this.id = post.id;
    this.content = bot.config.trimContent ? post.content.trim() : post.content;
    this.created = post.created;
    this.category = post.category;
    this.user = post.user;
    this.image = post.image;
    this.sticker = post.sticker;
    this.bot = bot;
  }

  async reply(
    content?: string,
    attachments?: { image?: string; sticker?: string }
  ): Promise<ResponseSuccess<Comment> | ResponseFail> {
    Object.entries(this.bot.replyHistory).forEach(async ([username, history]) => {
      if (history.lastReply && Date.now() - history.lastReply > 1000 * 60 * 3.5) {
        delete this.bot.replyHistory[username];
        accounts.push({ username, password: history.bot.password });

        if (username === this.bot.currentReplyAccount) this.bot.currentReplyAccount = undefined;
      }
    });

    if (!this.bot.currentReplyAccount) {
      if (Object.keys(this.bot.replyHistory).length === 0) {
        this.bot.replyHistory = {
          [this.bot.username]: { count: 0, lastReply: undefined, bot: this.bot },
        };
        this.bot.currentReplyAccount = this.bot.username;
      } else {
        this.bot.currentReplyAccount = Object.keys(this.bot.replyHistory)[0];
      }
    }

    const replyHistory = this.bot.replyHistory[this.bot.currentReplyAccount];

    if (replyHistory.count < this.bot.config.maxRepliesBeforeCooldown) {
      await replyHistory.bot.login();

      const splitComment = (content?.length ?? 0) > 500;

      const commentRes = await replyHistory.bot.gql<CreateComment>(CREATE_COMMENT, {
        content: splitComment ? content?.slice(0, 500) : content,
        ...(attachments?.image && { image: attachments?.image }),
        ...(attachments?.sticker && { stickerItem: attachments?.sticker }),
        target: this.id,
        targetSubject: "discuss",
        targetType: "individual",
      } as CreateCommentVariables);
      if (!commentRes.success) {
        if (commentRes.message === "429") {
          replyHistory.count = this.bot.config.maxRepliesBeforeCooldown;
          replyHistory.lastReply = Date.now();

          const subAccount = accounts.shift();
          if (!subAccount) return { success: false, message: "Account insufficient" };
          this.bot.replyHistory[subAccount.username] = {
            count: 0,
            lastReply: undefined,
            bot: new EntryBot(subAccount.username, subAccount.password, new CookieJar()),
          };
          this.bot.currentReplyAccount = subAccount.username;
          return await this.reply(content, attachments);
        }

        return { success: false, message: `Failed to create comment: ${commentRes.message}` };
      }

      replyHistory.count += 1;
      replyHistory.lastReply = Date.now();

      if (splitComment) return await this.reply(content?.slice(500), attachments);
      else return { success: true, data: new Comment(commentRes.data.createComment.comment, this.id, this.bot) };
    } else {
      const subAccount = accounts.shift();
      if (!subAccount) return { success: false, message: "Account insufficient" };
      this.bot.replyHistory[subAccount.username] = {
        count: 0,
        lastReply: undefined,
        bot: new EntryBot(subAccount.username, subAccount.password, new CookieJar()),
      };
      this.bot.currentReplyAccount = subAccount.username;
      return await this.reply(content, attachments);
    }
  }
}

export default Post;
