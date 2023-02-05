"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const community_1 = require("@/queries/community");
class Post {
    id;
    content;
    created;
    category;
    user;
    image;
    sticker;
    bot;
    constructor(post, bot) {
        this.id = post.id;
        this.content = bot.config.trimContent ? post.content.trim() : post.content;
        this.created = post.created;
        this.category = post.category;
        this.user = post.user;
        this.image = post.image;
        this.sticker = post.sticker;
        this.bot = bot;
    }
    async reply(content, attachments) {
        this.bot.replyHistory.forEach((date, i) => {
            if (Date.now() - date > this.bot.config.cooldown) {
                this.bot.replyHistory.splice(i, 1);
            }
        });
        if (this.bot.replyHistory.length > this.bot.config.maxRepliesBeforeCooldown) {
            console.log("글정 방지", this.bot.replyHistory);
        }
        const commentRes = await this.bot.gql(community_1.CREATE_COMMENT, {
            content,
            ...(attachments?.image && { image: attachments?.image }),
            ...(attachments?.sticker && { stickerItem: attachments?.sticker }),
            target: this.id,
            targetSubject: "discuss",
            targetType: "individual",
        });
        if (!commentRes.success)
            return { success: false, message: `Failed to create comment: ${commentRes.message}` };
        this.bot.replyHistory.push(Date.now());
        return { success: true, data: commentRes.data.createComment };
    }
}
exports.default = Post;
