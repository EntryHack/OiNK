"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFetch = void 0;
const fetch_cookie_1 = __importDefault(require("fetch-cookie"));
const createFetch = (cookieJar) => {
    const fetch = (0, fetch_cookie_1.default)(globalThis.fetch, cookieJar);
    return fetch;
};
exports.createFetch = createFetch;
