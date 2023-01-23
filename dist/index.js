"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const fetch_1 = __importDefault(require("@/utils/fetch"));
(0, fetch_1.default)("https://google.com")
    .then((res) => res.text())
    .then(console.log);
