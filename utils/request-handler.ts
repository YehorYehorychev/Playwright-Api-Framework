export class requestHandler {
  private baseUrl: string;
  private apiPath: string = "";
  private queryParams: object = {};
  private apiheaders: object = {};
  private requestBody: object = {};

  url(url: string) {
    this.baseUrl = url;
  }

  path(path: string) {
    this.apiPath = path;
  }

  params(params: object) {
    this.queryParams = params;
  }

  headers(headers: object) {
    this.apiheaders = headers;
  }

  body(body: object) {
    this.requestBody = body;
  }
}
