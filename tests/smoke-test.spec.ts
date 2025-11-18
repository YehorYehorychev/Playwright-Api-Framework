import { test, expect } from "../utils/fixtures";

// Example of a smoke test using RequestHandler
test("GET All Articles", async ({ api }) => {
  const response = await api
    .url("https://conduit-api.bondaracademy.com")
    .path("/api/articles")
    .params({ limit: 10, offset: 0 })
    .body({ user: { email: "yehorTest@gmail.com", password: "yehortest" } });
});
