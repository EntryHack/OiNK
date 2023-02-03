import { MinimalImage } from "./common.d";

export interface MinimalDiscuss {
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
}

export interface MinimalDiscussList {
  list: MinimalDiscuss[];
}

export interface CreateComment {
  comment: {
    id: string;
    content: string;
    created: string;
    image: MinimalImage;
    sticker: MinimalImage;
  };
}

export interface CreateCommentVariables extends StringKey {
  content?: string;
  image?: string;
  sticker?: string;
  stickerItem?: string;
  target?: string;
  targetSubject?: "discuss";
  targetType?: "individual";
  groupId?: string;
  [key: string]: any;
}
