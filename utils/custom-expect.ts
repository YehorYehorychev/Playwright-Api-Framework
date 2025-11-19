import { expect as baseExpect } from "@playwright/test";
import { APILogger } from "../utils/logger";

let apiLogger: APILogger | undefined;

export const setCustomExpectLogger = (logger: APILogger) => {
  apiLogger = logger;
};

declare global {
  namespace PlaywrightTest {
    interface Matchers<R, T> {
      shouldEqual(expected: T): R;
      shouldBeLessThanOrEqual(expected: T): R;
    }
  }
}

baseExpect.extend({
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
