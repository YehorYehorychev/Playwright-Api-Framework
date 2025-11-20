import { RequestHandler } from "../utils/request-handler";
import { config } from "../api-test.config";
import { APILogger } from "../utils/logger";
import { request } from "@playwright/test";

export async function createToken(
  email: string,
  password: string
): Promise<string> {
  const conext = await request.newContext();
  const logger = new APILogger();
  const api = new RequestHandler(conext, config.apiUrl, logger);

  try {
    const tokenResponse = await api
      .path("/users/login")
      .body({ user: { email: email, password: password } })
      .postRequest(200);

    return "Token " + tokenResponse.user.token;
  } catch (error: any) {
    Error.captureStackTrace(error, createToken);
    throw error;
  } finally {
    await conext.dispose();
  }
}
