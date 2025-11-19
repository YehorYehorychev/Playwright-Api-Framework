import { APIRequestContext, expect } from "@playwright/test";
import { APILogger } from "./logger";

export class RequestHandler {
  private request: APIRequestContext;
  private baseUrl: string;
  private logger: APILogger;
  private defaultBaseUrl: string;
  private apiPath: string = "";
  private queryParams: object = {};
  private apiheaders: Record<string, string> = {};
  private requestBody: object = {};

  constructor(
    request: APIRequestContext,
    apiBaseUrl?: string,
    logger: APILogger
  ) {
    this.request = request;
    this.defaultBaseUrl = apiBaseUrl;
    this.logger = logger;
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
    this.logger.logRequest("GET", url, this.apiheaders);
    const response = await this.request.get(url, {
      headers: this.apiheaders,
    });

    const actualStatus = response.status();
    const responseJson = await response.json();

    this.logger.logResponse(actualStatus, responseJson);
    this.statusCodeValidator(actualStatus, statusCode);

    return responseJson;
  }

  // ========= POST ==========
  async postRequest(statusCode: number) {
    const url = this.getUrl();
    this.logger.logRequest("POST", url, this.apiheaders, this.requestBody);
    const response = await this.request.post(url, {
      headers: {
        "Content-Type": "application/json",
        ...this.apiheaders,
      },
      data: this.requestBody,
    });

    const actualStatus = response.status();
    const responseJson = await response.json();

    this.logger.logResponse(actualStatus, responseJson);

    this.statusCodeValidator(actualStatus, statusCode);
    return responseJson;
  }

  // ========= PUT ==========
  async putRequest(statusCode: number) {
    const url = this.getUrl();
    this.logger.logRequest("PUT", url, this.apiheaders, this.requestBody);
    const response = await this.request.put(url, {
      headers: {
        "Content-Type": "application/json",
        ...this.apiheaders,
      },
      data: this.requestBody,
    });

    const actualStatus = response.status();
    const responseJson = await response.json();

    this.logger.logResponse(actualStatus, responseJson);

    this.statusCodeValidator(actualStatus, statusCode);
    return responseJson;
  }

  // ========= DELETE ==========
  async deleteRequest(statusCode: number) {
    const url = this.getUrl();
    this.logger.logRequest("DELETE", url, this.apiheaders);
    const response = await this.request.delete(url, {
      headers: this.apiheaders,
    });

    const actualStatus = response.status();
    this.logger.logResponse(actualStatus);

    this.statusCodeValidator(actualStatus, statusCode);
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

  private statusCodeValidator(actualStatus: number, expectedStatus: number) {
    if (actualStatus !== expectedStatus) {
      const logs = this.logger.getRecentLogs();
      const error = new Error(
        `Expected status code ${expectedStatus} but received ${actualStatus}.\n\nRecent Logs:\n${logs}`
      );
      throw error;
    }
  }
}
