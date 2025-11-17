export class requestHandler {
  private baseUrl: string;
  private apiPath: string = "";
  private queryParams: object = {};
  private apiheaders: object = {};
  private requestBody: object = {};

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

  headers(headers: object) {
    this.apiheaders = headers;
    return this;
  }

  body(body: object) {
    this.requestBody = body;
    return this;
  }
}
