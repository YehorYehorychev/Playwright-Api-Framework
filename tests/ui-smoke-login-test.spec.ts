import { test, expect } from "@playwright/test";

test("UI-Login functionality Smoke Test", async ({ page }) => {
  await page.goto("https://conduit.bondaracademy.com/");
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.getByRole("textbox", { name: "Email" }).click();

  await page
    .getByRole("textbox", { name: "Email" })
    .fill("yehorTest@gmail.com");
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill("yehortest");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(
    page.getByRole("link", { name: "Discover Bondar Academy: Your" })
  ).toBeVisible();

  await page
    .getByRole("link", { name: "Discover Bondar Academy: Your" })
    .click();

  await expect(
    page.getByRole("heading", { name: "Discover Bondar Academy: Your" })
  ).toBeVisible();
});
