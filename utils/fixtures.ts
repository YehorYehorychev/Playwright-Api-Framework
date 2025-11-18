import { test as base, expect } from "@playwright/test";
import { RequestHandler } from "../utils/request-handler";

export type TestOpions = {
  api: RequestHandler;
};

export const test = base.extend<TestOpions>({
  api: async ({}, use) => {
    const requestHandler = new RequestHandler();
    await use(requestHandler);
  },
});

export { expect };
