"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fetch_cookie_1 = __importDefault(require("fetch-cookie"));
const tough_cookie_1 = require("tough-cookie");
const tough_cookie_file_store_1 = require("tough-cookie-file-store");
const cookieJar = new tough_cookie_1.CookieJar(new tough_cookie_file_store_1.FileCookieStore("./cookie.json"));
const fetch = (0, fetch_cookie_1.default)(globalThis.fetch, cookieJar);
exports.default = fetch;
