import EventEmitter from "events";
import type TypedEmitter from "typed-emitter";
import type { CookieJar } from "tough-cookie";
import Post from "@/post";
import { createFetch } from "@/utils/fetch";
import { SIGNIN_BY_USERNAME } from "@/queries/user";
import { SELECT_MINIMAL_DISCUSS_LIST } from "@/queries/community";
import type { MinimalDiscussList } from "@/queries/community.d";
import type { Fetch, ResponseFail, ResponseSuccess } from "@/types";

type VariableKey = Variables | string | number | boolean | null | VariableKey[];
interface Variables {
  [key: string]: VariableKey;
}

export interface Credentials {
  logon: boolean;
  user: {
    id: string | undefined;
    username: string | undefined;
  };
  token: {
    csrfToken: string | undefined;
    xToken: string | undefined;
  };
  updated: number;
}

type GraphQLResponse<T> = ResponseSuccess<T> | ResponseFail;
type LoginResponse = ResponseSuccess<Credentials> | ResponseFail;
type CredentialsResponse = ResponseSuccess<Credentials> | ResponseFail;

const credentials: Credentials = {
  logon: false,
  user: {
    id: undefined,
    username: undefined,
  },
  token: {
    csrfToken: undefined,
    xToken: undefined,
  },
  updated: 0,
};

type EntryBotEvents = {
  ready: (credentials: Credentials) => Promise<void> | void;
  post: (post: Post) => Promise<void> | void;
};

export interface EntryBotConfig {
  readInterval: number;
  readCount: number;
  targetCategory: string;
  cooldown: number;
  maxRepliesBeforeCooldown: number;
  trimContent: boolean;
  proxy?: any;
}

class EntryBot extends (EventEmitter as new () => TypedEmitter<EntryBotEvents>) {
  logon: boolean;
  username: string;
  password: string;
  config: EntryBotConfig;
  fetch: Fetch;
  cookieJar: CookieJar;
  interval?: NodeJS.Timer;
  replyHistory: { [username: string]: { count: number; lastReply: number | undefined; bot: EntryBot } };
  currentReplyAccount: string | undefined;

  constructor(username: string, password: string, cookieJar: CookieJar, config?: Partial<EntryBotConfig>) {
    super();
    this.logon = false;
    this.username = username;
    this.password = password;
    this.cookieJar = cookieJar;
    this.config = {
      readInterval: config?.readInterval ?? 500,
      readCount: config?.readCount ?? 10,
      targetCategory: config?.targetCategory ?? "free",
      cooldown: config?.cooldown ?? 1000 * 60 * 3.5,
      maxRepliesBeforeCooldown: config?.maxRepliesBeforeCooldown ?? 8,
      trimContent: config?.trimContent ?? true,
      proxy: config?.proxy,
    };
    this.fetch = createFetch(cookieJar);
    this.replyHistory = { [username]: { count: 0, lastReply: undefined, bot: this } };
    this.currentReplyAccount = username;
  }

  async getCredentials(forceUpdate?: boolean, fetch: Fetch = this.fetch): Promise<CredentialsResponse> {
    try {
      if (
        !forceUpdate &&
        Date.now() - credentials.updated <= 1000 * 60 * 60 * 3 &&
        credentials.user.username === this.username
      )
        return { success: true, data: credentials };

      const res = await fetch("https://playentry.org");
      if (!res.ok) return { success: false, message: res.statusText };
      const html = await res.text();

      const __NEXT_DATA__ = /\<script id="__NEXT_DATA__".*\>((.|\n)+)\<\/script\>/.exec(html)?.[1];
      if (!__NEXT_DATA__) return { success: false, message: "Failed to get __NEXT_DATA__" };

      const parsedData = JSON.parse(__NEXT_DATA__);

      const csrfToken = parsedData.props.initialProps.csrfToken;
      const user = parsedData.props.initialState.common.user;
      const _id = user?._id;
      const username = user?.username;
      const xToken = user?.xToken;

      if (this.logon && this.username !== username) return await this.getCredentials(true, fetch);

      credentials.logon = !!user;
      credentials.user = { id: _id, username };
      credentials.token = { csrfToken, xToken };
      credentials.updated = Date.now();
      return { success: true, data: credentials };
    } catch (err: any) {
      return { success: false, message: err.toString() };
    }
  }

  async gql<T>(
    query: string,
    variables: Variables = {},
    init: Omit<RequestInit, "body" | "method"> = {},
    fetch: Fetch = this.fetch
  ): Promise<GraphQLResponse<{ [key: string]: T }>> {
    try {
      const credentialsRes = await this.getCredentials(false, fetch);
      if (!credentialsRes.success) return credentialsRes;
      const credentials = credentialsRes.data;

      const res = await fetch("https://playentry.org/graphql", {
        ...init,
        method: "POST",
        headers: {
          ...init.headers,
          "Content-Type": "application/json",
          ...(credentials.token?.csrfToken && { "csrf-token": credentials.token.csrfToken }),
          ...(credentials.token?.xToken && { "x-token": credentials.token.xToken }),
        },
        body: JSON.stringify({ query, variables }),
      });
      const json: { errors?: { statusCode?: number }[]; data?: any; extensions: { runtime?: number } } =
        await res.json();

      if (json.errors?.[0])
        return { success: false, ...(json.errors[0].statusCode && { message: json.errors[0].statusCode.toString() }) };

      return { success: true, data: json.data };
    } catch (err: any) {
      return { success: false, message: err.toString() };
    }
  }

  async login(remember: boolean = true): Promise<LoginResponse> {
    let credentialsRes = await this.getCredentials();
    if (!credentialsRes.success) throw new Error("Failed to get credentials");

    if (credentialsRes.data.logon) return { success: true, data: credentialsRes.data };

    const signinRes = await this.gql(SIGNIN_BY_USERNAME, {
      username: this.username,
      password: this.password,
      rememberme: remember,
    });

    if (signinRes.success) {
      credentialsRes = await this.getCredentials(true);
      if (credentialsRes.success) {
        this.logon = credentialsRes.data.logon;
        return { success: true, data: credentialsRes.data };
      } else return { success: false, message: `Failed to login: ${credentialsRes.message}` };
    }

    return { success: false, message: `Failed to login: ${signinRes.message}` };
  }

  async getPosts(): Promise<ResponseSuccess<MinimalDiscussList> | ResponseFail> {
    const discussListRes = await this.gql<MinimalDiscussList>(SELECT_MINIMAL_DISCUSS_LIST, {
      category: this.config.targetCategory,
      searchType: "scroll",
      pageParam: {
        display: this.config.readCount,
        sort: "created",
      },
    });
    if (!discussListRes.success)
      return { success: false, message: `Failed to get discuss list: ${discussListRes.message}` };

    return { success: true, data: discussListRes.data.discussList };
  }

  async listenPosts() {
    const postsRes = await this.getPosts();
    if (!postsRes.success) return;
    const readIds = postsRes.data.list.map((post) => post.id);

    this.interval = setInterval(async () => {
      const postsRes = await this.getPosts();
      if (!postsRes.success) return;

      const newPosts = postsRes.data.list.filter((post) => !readIds.includes(post.id));

      newPosts.forEach((post) => {
        this.emit("post", new Post(post, this));
        readIds.push(post.id);
      });
    }, this.config.readInterval);
  }

  async unlistenPosts() {
    clearInterval(this.interval);
  }

  async listen(remember: boolean = true) {
    const loginRes = await this.login(remember);
    if (!loginRes.success) return;

    this.listenPosts();
    this.emit("ready", loginRes.data);
  }
}

export default EntryBot;
