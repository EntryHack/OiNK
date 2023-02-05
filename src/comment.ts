import { CookieJar } from "tough-cookie";
import EntryBot from "./entrybot";
import { CREATE_COMMENT, REMOVE_COMMENT } from "./queries/community";
import type { MinimalImage } from "./queries/common.d";
import type { CreateComment, CreateCommentVariables, MinimalComment } from "./queries/community.d";
import type { ResponseFail, ResponseSuccess } from "./types";
import accounts from "../accounts.json";

const unusedAccounts = JSON.parse(JSON.stringify(accounts));

class Comment implements MinimalComment {
  id: string;
  content: string;
  created: string;
  parentId: string;
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

  constructor(comment: MinimalComment, parentId: string, bot: EntryBot) {
    this.id = comment.id;
    this.content = bot.config.trimContent ? comment.content.trim() : comment.content;
    this.created = comment.created;
    this.parentId = parentId;
    this.user = comment.user;
    this.image = comment.image;
    this.sticker = comment.sticker;
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

  async remove(): Promise<ResponseSuccess<{ id: string }> | ResponseFail> {
    if (this.user.username === process.env.BOT_USERNAME) {
      const removeRes = await this.bot.gql<{ id: string }>(REMOVE_COMMENT, { id: this.id });
      if (!removeRes.success) return { success: false, message: `Failed to remove comment: ${removeRes.message}` };
      return { success: true, data: removeRes.data.removeComment };
    } else {
      const account = accounts.find(({ username }) => username === this.user.username);
      if (!account) return { success: false, message: "Comment is not written by you" };

      const bot = new EntryBot(account.username, account.password, new CookieJar());
      await bot.login();

      const removeRes = await bot.gql<{ id: string }>(REMOVE_COMMENT, { id: this.id });
      if (!removeRes.success) return { success: false, message: `Failed to remove comment: ${removeRes.message}` };
      return { success: true, data: removeRes.data.removeComment };
    }
  }
}

export default Comment;
