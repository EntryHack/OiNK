import fetchCookie from "fetch-cookie";
import { CookieJar } from "tough-cookie";

export const createFetch = (cookieJar?: CookieJar) => {
  const fetch = fetchCookie(globalThis.fetch, cookieJar);

  return fetch;
};
