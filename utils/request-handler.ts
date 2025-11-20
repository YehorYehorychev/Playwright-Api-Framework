import { APIRequestContext, test } from "@playwright/test";
import { APILogger } from "./logger";

export class RequestHandler {
  private request: APIRequestContext;
  private baseUrl?: string;
  private defaultBaseUrl: string;
  private logger: APILogger;
  private apiPath: string = "";
  private queryParams: Record<string, any> = {};
  private apiheaders: Record<string, string> = {};
  private requestBody: object = {};
  private defaultAuthToken: string;
  private clearAuthFlag: boolean = false;

  constructor(
    request: APIRequestContext,
    apiBaseUrl: string,
    logger: APILogger,
    authToken: string = ""
  ) {
    this.request = request;
    this.defaultBaseUrl = apiBaseUrl;
    this.logger = logger;
    this.defaultAuthToken = authToken;
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

  clearAuth() {
    this.clearAuthFlag = true;
    return this;
  }

  // ========== GET ==========
  async getRequest(statusCode: number) {
    const url = this.getUrl();
    const headers = this.getHeaders();

    let response: any;

    await test.step(`GET ${url}`, async () => {
      this.logger.logRequest("GET", url, headers);
      response = await this.request.get(url, { headers });
    });

    return this.handleResponse(response, statusCode);
  }

  // ========== POST ==========
  async postRequest(statusCode: number) {
    const url = this.getUrl();
    const headers = {
      "Content-Type": "application/json",
      ...this.getHeaders(),
    };

    let response: any;

    await test.step(`POST ${url}`, async () => {
      this.logger.logRequest("POST", url, headers, this.requestBody);

      response = await this.request.post(url, {
        headers,
        data: this.requestBody,
      });
    });

    return this.handleResponse(response, statusCode);
  }

  // ========== PUT ==========
  async putRequest(statusCode: number) {
    const url = this.getUrl();
    const headers = {
      "Content-Type": "application/json",
      ...this.getHeaders(),
    };

    let response: any;

    await test.step(`PUT ${url}`, async () => {
      this.logger.logRequest("PUT", url, headers, this.requestBody);

      response = await this.request.put(url, {
        headers,
        data: this.requestBody,
      });
    });

    return this.handleResponse(response, statusCode);
  }

  // ========== DELETE ==========
  async deleteRequest(statusCode: number) {
    const url = this.getUrl();
    const headers = this.getHeaders();

    let response: any;

    await test.step(`DELETE ${url}`, async () => {
      this.logger.logRequest("DELETE", url, headers);
      response = await this.request.delete(url, { headers });
    });

    await this.handleResponse(response, statusCode);
  }

  // ========== HELPERS ==========

  private getUrl() {
    const url = new URL(
      `${this.baseUrl ?? this.defaultBaseUrl}${this.apiPath}`
    );

    for (const [key, value] of Object.entries(this.queryParams)) {
      url.searchParams.append(key, String(value));
    }

    return url.toString();
  }

  private getHeaders(): Record<string, string> {
    const headers = { ...this.apiheaders };

    if (!this.clearAuthFlag && this.defaultAuthToken) {
      headers["Authorization"] =
        headers["Authorization"] ?? this.defaultAuthToken;
    }

    return headers;
  }

  private async handleResponse(response: any, expectedStatus: number) {
    const actual = response.status();
    const json = await response.json().catch(() => null);

    this.logger.logResponse(actual, json);

    if (actual !== expectedStatus) {
      const logs = this.logger.getRecentLogs();
      throw new Error(
        `Expected status ${expectedStatus}, got ${actual}\n\nLogs:\n${logs}`
      );
    }

    this.cleanUpFields();
    return json;
  }

  private cleanUpFields() {
    this.apiPath = "";
    this.baseUrl = undefined;
    this.queryParams = {};
    this.apiheaders = {};
    this.requestBody = {};
    this.clearAuthFlag = false;
  }
}
