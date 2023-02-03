"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tokens_1 = __importDefault(require("@/utils/tokens"));
const gql = async (query, variables, init) => {
    try {
        const tokensRes = await (0, tokens_1.default)();
        if (!tokensRes.success)
            return tokensRes;
        const tokens = tokensRes.data;
        const res = await fetch("https://playentry.org/graphql", {
            ...init,
            method: "POST",
            headers: {
                ...init.headers,
                ...(tokens.csrfToken && { "CSRF-Token": tokens.csrfToken }),
                ...(tokens.xToken && { "x-token": tokens.xToken }),
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
};
exports.default = gql;
