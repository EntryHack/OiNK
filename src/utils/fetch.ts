import fetchCookie from "fetch-cookie";
import { Cookie, CookieJar } from "tough-cookie";
import { FileCookieStore } from "tough-cookie-file-store";

const cookieJar = new CookieJar(new FileCookieStore("./cookie.json"));

const fetch = fetchCookie(globalThis.fetch, cookieJar);

export default fetch;
