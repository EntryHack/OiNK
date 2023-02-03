import fetchCookie from "fetch-cookie";
import { CookieJar } from "tough-cookie";
import { FileCookieStore } from "tough-cookie-file-store";

export const createFetch = (cookieStorePath?: string) => {
  const cookieJar = cookieStorePath ? new CookieJar(new FileCookieStore(cookieStorePath)) : new CookieJar();
  const fetch = fetchCookie(globalThis.fetch, cookieJar);

  return fetch;
};
