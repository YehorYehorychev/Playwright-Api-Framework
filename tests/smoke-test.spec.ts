import { test, expect, request } from "@playwright/test";
import { RequestHandler } from "../utils/request-handler";

// Example of a smoke test using RequestHandler
test.skip("GET All Articles", async ({ request }) => {
  const api = new RequestHandler();

  // https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0
  api
    .url("https://conduit-api.bondaracademy.com/api")
    .path("/articles")
    .params({ limit: 10, offset: 10 })
    .headers({ Authorization: `Auth Token` })
    .body({ user: { email: "yehorTest@gmail.com", password: "yehortest" } });
});
