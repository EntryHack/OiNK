import EventEmitter from "events";
import type TypedEmitter from "typed-emitter";
import { createFetch } from "@/utils/fetch";
import { SIGNIN_BY_USERNAME } from "@/queries/user";
import { Fetch, ResponseFail, ResponseSuccess } from "@/types";

export interface EntryBotConfig {
  readInterval: number;
  readCount: number;
  trimContent: boolean;
  fileCookieStorePath?: string;
  proxy?: any;
}

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

interface CredentialsResponseSuccess {
  success: true;
  data: Credentials;
}

interface CredentialsResponseFail {
  success: false;
  message?: string;
}

type GraphQLResponse<T> = ResponseSuccess<T> | ResponseFail;
type LoginResponse = ResponseSuccess<Credentials> | ResponseFail;
type CredentialsResponse = CredentialsResponseSuccess | CredentialsResponseFail;

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
  updated: -1,
};

type EntryBotEvents = {
  login: (credentials: Credentials) => Promise<void> | void;
};

class EntryBot extends (EventEmitter as new () => TypedEmitter<EntryBotEvents>) {
  logon: boolean;
  #username: string;
  #password: string;
  config: EntryBotConfig;
  fetch: Fetch;

  constructor(username: string, password: string, config?: Partial<EntryBotConfig>) {
    super();
    this.logon = false;
    this.#username = username;
    this.#password = password;
    this.config = {
      readInterval: config?.readInterval ?? 500,
      readCount: config?.readCount ?? 4,
      trimContent: config?.trimContent ?? true,
      fileCookieStorePath: config?.fileCookieStorePath,
      proxy: config?.proxy,
    };
    this.fetch = createFetch(config?.fileCookieStorePath);
  }

  async getCredentials(forceUpdate?: boolean): Promise<CredentialsResponse> {
    try {
      if (!forceUpdate && Math.abs(credentials.updated - Date.now()) <= 3 * 1000 * 60 * 60)
        return { success: true, data: credentials };

      const res = await this.fetch("https://playentry.org");
      if (!res.ok) return { success: false, message: res.statusText };
      const html = await res.text();

      const __NEXT_DATA__ = /\<script id="__NEXT_DATA__".*\>((.|\n)+)\<\/script\>/.exec(html)?.[1];
      if (!__NEXT_DATA__) return { success: false, message: "Cannot get __NEXT_DATA__" };

      const parsedData = JSON.parse(__NEXT_DATA__);

      const csrfToken = parsedData.props.initialProps.csrfToken;
      const user = parsedData.props.initialState.common.user;
      const _id = user?._id;
      const username = user?.username;
      const xToken = user?.xToken;

      if (this.logon && this.#username !== username) return await this.getCredentials(true);

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
    init: Omit<RequestInit, "body" | "method"> = {}
  ): Promise<GraphQLResponse<T>> {
    try {
      const credentialsRes = await this.getCredentials();
      if (!credentialsRes.success) return credentialsRes;
      const credentials = credentialsRes.data;

      const res = await this.fetch("https://playentry.org/graphql", {
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

    if (credentialsRes.data.logon) {
      this.emit("login", credentialsRes.data);
      return { success: true, data: credentialsRes.data };
    }

    const signinRes = await this.gql(SIGNIN_BY_USERNAME, {
      username: this.#username,
      password: this.#password,
      rememberme: remember,
    });

    if (signinRes.success) {
      credentialsRes = await this.getCredentials(true);
      if (credentialsRes.success) {
        this.emit("login", credentialsRes.data);
        return { success: true, data: credentialsRes.data };
      } else return { success: false, message: `Failed to login: ${credentialsRes.message}` };
    }

    return { success: false, message: `Failed to login: ${signinRes.message}` };
  }
}

export default EntryBot;
