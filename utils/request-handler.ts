import { APIRequestContext, expect } from "@playwright/test";

export class RequestHandler {
  private request: APIRequestContext;
  private baseUrl: string;
  private defaultBaseUrl: string;
  private apiPath: string = "";
  private queryParams: object = {};
  private apiheaders: Record<string, string> = {};
  private requestBody: object = {};

  constructor(request: APIRequestContext, apiBaseUrl?: string) {
    this.request = request;
    this.defaultBaseUrl = apiBaseUrl;
  }

  url(url: string) {
    this.baseUrl = url;
    return this;
  }

  path(path: string) {
    this.apiPath = path;
    return this;
  }

  params(params: object) {
    this.queryParams = params;
    return this;
  }

  headers(headers: Record<string, string>) {
    this.apiheaders = headers;
    return this;
  }

  body(body: object) {
    this.requestBody = body;
    return this;
  }

  // ========= GET ==========
  async getRequest(statusCode: number) {
    const url = this.getUrl();
    const response = await this.request.get(url, {
      headers: this.apiheaders,
    });

    expect(response.status()).toBe(statusCode);
    return await response.json();
  }

  // ========= POST ==========
  async postRequest(statusCode: number) {
    const url = this.getUrl();
    const response = await this.request.post(url, {
      headers: {
        "Content-Type": "application/json",
        ...this.apiheaders,
      },
      data: this.requestBody,
    });

    expect(response.status()).toBe(statusCode);
    return await response.json();
  }

  // ========= PUT ==========
  async putRequest(statusCode: number) {
    const url = this.getUrl();
    const response = await this.request.put(url, {
      headers: {
        "Content-Type": "application/json",
        ...this.apiheaders,
      },
      data: this.requestBody,
    });

    expect(response.status()).toBe(statusCode);
    return await response.json();
  }

  // ========= DELETE ==========
  async deleteRequest(statusCode: number) {
    const url = this.getUrl();
    const response = await this.request.delete(url, {
      headers: this.apiheaders,
    });

    expect(response.status()).toBe(statusCode);
  }

  private getUrl() {
    const url = new URL(
      `${this.baseUrl ?? this.defaultBaseUrl}${this.apiPath}`
    );

    for (const [key, value] of Object.entries(this.queryParams)) {
      url.searchParams.append(key, String(value));
    }

    return url.toString();
  }
}
