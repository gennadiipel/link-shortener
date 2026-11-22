type FetchRequest = (url: string, init: RequestInit) => Promise<Response>;

export type HttpClient = {
  post: (path: string, body: unknown) => Promise<unknown>;
};

export class HttpError extends Error {
  constructor(public readonly status: number) {
    super("The API request failed.");
    this.name = "HttpError";
  }
}

export function createHttpClient(
  baseUrl: string,
  fetchRequest: FetchRequest = fetch,
): HttpClient {
  return {
    async post(path, body) {
      const response = await fetchRequest(
        `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        throw new HttpError(response.status);
      }

      return response.json();
    },
  };
}
