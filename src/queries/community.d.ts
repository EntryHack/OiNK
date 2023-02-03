export interface MinimalDiscuss {
  id: string;
  content: string;
  created: string;
  category: string;
  user: {
    id: string;
    username: string;
    nickname: string;
    profileImage: {
      id: string;
      filename: string;
      imageType: string;
    } | null;
    coverImage: {
      id: string;
      filename: string;
      imageType: string;
    } | null;
    role: "member" | "teacher" | "student" | "admin";
  };
  image: {
    id: string;
    name: string;
    filename: string;
    imageType: string;
  } | null;
  sticker: {
    id: string;
    name: string;
    filename: string;
    imageType: string;
  } | null;
}

export interface MinimalDiscussList {
  list: MinimalDiscuss[];
}
