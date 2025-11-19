export class APILogegr {
  private recentLogs: any[] = [];

  logRequest(
    method: string,
    url: string,
    headers: Record<string, string>,
    body?: any
  ) {
    const logEntry = {
      type: "request",
      method,
      url,
      headers,
      body,
      timestamp: new Date().toISOString(),
    };
    this.recentLogs.push({ type: "Request Details", data: logEntry });
    console.log("Request:", logEntry);
  }
}
