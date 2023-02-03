export interface ResponseSuccess<T> {
  success: true;
  data: T;
}

export interface ResponseFail {
  success: false;
  message?: string;
}

export type Fetch = (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>;
