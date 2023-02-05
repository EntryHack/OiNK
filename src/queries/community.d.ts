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
    status: { following: number; follower: number };
    description: string;
    role: "member" | "teacher" | "student" | "admin";
  };
  image: MinimalImage;
  sticker: MinimalImage;
}

export interface MinimalDiscussList {
  list: MinimalDiscuss[];
}

export interface CreateEntryStory {
  discuss: {
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
  };
}

export interface MinimalComment {
  id: string;
  content: string;
  created: string;
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
}

export interface CreateComment {
  comment: MinimalComment;
}

export interface CreateEntryStoryVariables extends StringKey {
  content?: string;
  text?: string;
  image?: string;
  sticker?: string;
  stickerItem?: string;
  cursor?: string;
  [key: string]: any;
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
