import { test, expect, request } from "@playwright/test";

test("GET request", async ({ request }) => {
  const res = await request.get("https://conduit-api.bondaracademy.com/api/tags");
  console.log(await res.json());
});