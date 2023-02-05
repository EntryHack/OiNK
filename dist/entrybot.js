"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const post_1 = __importDefault(require("@/post"));
const fetch_1 = require("@/utils/fetch");
const user_1 = require("@/queries/user");
const community_1 = require("@/queries/community");
const credentials = {
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
class EntryBot extends events_1.default {
    logon;
    #username;
    #password;
    config;
    fetch;
    cookieJar;
    interval;
    replyHistory = [];
    constructor(username, password, cookieJar, config) {
        super();
        this.logon = false;
        this.#username = username;
        this.#password = password;
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
        this.fetch = (0, fetch_1.createFetch)(cookieJar);
    }
    async getCredentials(forceUpdate, fetch = this.fetch) {
        try {
            if (!forceUpdate && Date.now() - credentials.updated <= 1000 * 60 * 60 * 3)
                return { success: true, data: credentials };
            const res = await fetch("https://playentry.org");
            if (!res.ok)
                return { success: false, message: res.statusText };
            const html = await res.text();
            const __NEXT_DATA__ = /\<script id="__NEXT_DATA__".*\>((.|\n)+)\<\/script\>/.exec(html)?.[1];
            if (!__NEXT_DATA__)
                return { success: false, message: "Failed to get __NEXT_DATA__" };
            const parsedData = JSON.parse(__NEXT_DATA__);
            const csrfToken = parsedData.props.initialProps.csrfToken;
            const user = parsedData.props.initialState.common.user;
            const _id = user?._id;
            const username = user?.username;
            const xToken = user?.xToken;
            if (this.logon && this.#username !== username)
                return await this.getCredentials(true, fetch);
            credentials.logon = !!user;
            credentials.user = { id: _id, username };
            credentials.token = { csrfToken, xToken };
            credentials.updated = Date.now();
            return { success: true, data: credentials };
        }
        catch (err) {
            return { success: false, message: err.toString() };
        }
    }
    async gql(query, variables = {}, init = {}, fetch = this.fetch) {
        try {
            const credentialsRes = await this.getCredentials(false, fetch);
            if (!credentialsRes.success)
                return credentialsRes;
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
            const json = await res.json();
            if (json.errors?.[0])
                return { success: false, ...(json.errors[0].statusCode && { message: json.errors[0].statusCode.toString() }) };
            return { success: true, data: json.data };
        }
        catch (err) {
            return { success: false, message: err.toString() };
        }
    }
    async login(remember = true) {
        let credentialsRes = await this.getCredentials();
        if (!credentialsRes.success)
            throw new Error("Failed to get credentials");
        if (credentialsRes.data.logon)
            return { success: true, data: credentialsRes.data };
        const signinRes = await this.gql(user_1.SIGNIN_BY_USERNAME, {
            username: this.#username,
            password: this.#password,
            rememberme: remember,
        });
        if (signinRes.success) {
            credentialsRes = await this.getCredentials(true);
            if (credentialsRes.success)
                return { success: true, data: credentialsRes.data };
            else
                return { success: false, message: `Failed to login: ${credentialsRes.message}` };
        }
        return { success: false, message: `Failed to login: ${signinRes.message}` };
    }
    async getPosts() {
        const discussListRes = await this.gql(community_1.SELECT_MINIMAL_DISCUSS_LIST, {
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
        if (!postsRes.success)
            return;
        const readIds = postsRes.data.list.map((post) => post.id);
        this.interval = setInterval(async () => {
            const postsRes = await this.getPosts();
            if (!postsRes.success)
                return;
            const newPosts = postsRes.data.list.filter((post) => !readIds.includes(post.id));
            newPosts.forEach((post) => {
                this.emit("post", new post_1.default(post, this));
                readIds.push(post.id);
            });
        }, this.config.readInterval);
    }
    async unlistenPosts() {
        clearInterval(this.interval);
    }
    async listen(remember = true) {
        const loginRes = await this.login(remember);
        if (!loginRes.success)
            return;
        this.listenPosts();
        this.emit("ready", loginRes.data);
    }
}
exports.default = EntryBot;
