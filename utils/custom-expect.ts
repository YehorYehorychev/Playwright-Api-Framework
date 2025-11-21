import { expect as baseExpect } from "@playwright/test";
import { APILogger } from "../utils/logger";
import { validateSchema } from "./schema-validator";

let apiLogger: APILogger | undefined;

export const setCustomExpectLogger = (logger: APILogger) => {
  apiLogger = logger;
};

declare global {
  namespace PlaywrightTest {
    interface Matchers<R, T> {
      shouldEqual(expected: T): R;
      shouldBeLessThanOrEqual(expected: T): R;
      shouldMatchSchema(dirName: string, fileName: string): Promise<R>;
    }
  }
}

baseExpect.extend({
  async shouldMatchSchema(received: any, dirName: string, fileName: string) {
    let pass = true;
    let message: string = "";

    try {
      await validateSchema(dirName, fileName, received);
      pass = true;
      message = "Schema validation passed.";
    } catch (e: any) {
      pass = false;
      const logs = apiLogger?.getRecentLogs() ?? "";
      message = `${e.message}\n\n Recent API Logs:\n${logs}`;
    }

    return {
      message: () => message,
      pass,
    };
  },

  shouldEqual(this: any, received: any, expected: any) {
    let pass = true;
    let logs = "";

    try {
      baseExpect(received).toEqual(expected);
    } catch {
      pass = false;
      logs = apiLogger?.getRecentLogs() ?? "";
    }

    const message = () =>
      this.utils.matcherHint(
        `${this.isNot ? ".not" : ""}.toEqualWithLogs`,
        undefined,
        undefined,
        { isNot: this.isNot }
      ) +
      "\n\n" +
      `Expected: ${this.utils.printExpected(expected)}\n` +
      `Received: ${this.utils.printReceived(received)}\n\n` +
      `Recent API Logs:\n${logs}`;

    return { pass, message };
  },

  shouldBeLessThanOrEqual(this: any, received: any, expected: any) {
    let pass = true;
    let logs = "";

    try {
      baseExpect(received).toBeLessThanOrEqual(expected);
    } catch {
      pass = false;
      logs = apiLogger?.getRecentLogs() ?? "";
    }

    const message = () =>
      this.utils.matcherHint(
        `${this.isNot ? ".not" : ""}.toBeLessThanOrEqualWithLogs`,
        undefined,
        undefined,
        { isNot: this.isNot }
      ) +
      "\n\n" +
      `Expected: ${this.utils.printExpected(expected)}\n` +
      `Received: ${this.utils.printReceived(received)}\n\n` +
      `Recent API Logs:\n${logs}`;

    return { pass, message };
  },
});

export const expect = baseExpect;
