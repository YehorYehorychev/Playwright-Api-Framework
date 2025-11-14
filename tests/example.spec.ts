import { test, expect, request } from "@playwright/test";

test("GET request", async ({ request }) => {
  const tagsResponse = await request.get("https://conduit-api.bondaracademy.com/api/tags");
  const tagsResponseJson = await tagsResponse.json();

  expect(tagsResponse.status()).toBe(200);
  console.log(tagsResponseJson);
});