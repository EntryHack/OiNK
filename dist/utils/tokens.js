"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tokens = {
    csrfToken: undefined,
    xToken: undefined,
    updated: 0,
};
const getTokens = async () => {
    try {
        if (Math.abs(tokens.updated - Date.now()) <= 3 * 1000 * 60 * 60)
            return { success: true, data: tokens };
        const res = await fetch("https://playentry.org");
        if (!res.ok)
            return { success: false, message: res.statusText };
        const html = await res.text();
        const __NEXT_DATA__ = /\<script id="__NEXT_DATA__".*\>((.|\n)+)\<\/script\>/.exec(html)?.[1];
        if (!__NEXT_DATA__)
            return { success: false, message: "Cannot get __NEXT_DATA__" };
        const csrfToken = /"csrfToken":"?(.+?)",/.exec(__NEXT_DATA__)?.[1];
        const xToken = /"xToken":"?(.+?)",/.exec(__NEXT_DATA__)?.[1];
        tokens.csrfToken = csrfToken;
        tokens.xToken = xToken;
        tokens.updated = Date.now();
        return { success: true, data: tokens };
    }
    catch (err) {
        return { success: false, message: err.toString() };
    }
};
exports.default = getTokens;
