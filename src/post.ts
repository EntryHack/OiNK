import type EntryBot from "@/entrybot";
import { CREATE_COMMENT } from "@/queries/community";
import type { MinimalImage } from "@/queries/common.d";
import type { CreateComment, CreateCommentVariables, MinimalDiscuss } from "@/queries/community.d";
import type { ResponseFail, ResponseSuccess } from "@/types";

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
  ): Promise<ResponseSuccess<CreateComment> | ResponseFail> {
    this.bot.replyHistory.forEach((date, i) => {
      if (Date.now() - date > this.bot.config.cooldown) {
        this.bot.replyHistory.splice(i, 1);
      }
    });

    if (this.bot.replyHistory.length > this.bot.config.maxRepliesBeforeCooldown) {
      console.log("글정 방지", this.bot.replyHistory);
    }

    const commentRes = await this.bot.gql<CreateComment>(CREATE_COMMENT, {
      content,
      ...(attachments?.image && { image: attachments?.image }),
      ...(attachments?.sticker && { stickerItem: attachments?.sticker }),
      target: this.id,
      targetSubject: "discuss",
      targetType: "individual",
    } as CreateCommentVariables);
    if (!commentRes.success) return { success: false, message: `Failed to create comment: ${commentRes.message}` };

    this.bot.replyHistory.push(Date.now());

    return { success: true, data: commentRes.data.createComment };
  }
}

export default Post;
