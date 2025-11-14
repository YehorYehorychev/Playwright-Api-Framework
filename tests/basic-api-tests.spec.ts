import { test, expect, request } from "@playwright/test";

// GET
test("GET Tags", async ({ request }) => {
  const tagsResponse = await request.get(
    "https://conduit-api.bondaracademy.com/api/tags"
  );
  const tagsResponseJson = await tagsResponse.json();

  expect(tagsResponse.status()).toBe(200);
  expect(tagsResponseJson.tags[0]).toEqual("Test");
  expect(tagsResponseJson.tags.length).toBeLessThanOrEqual(10);
  console.log(tagsResponseJson);
});

test("GET All Articles", async ({ request }) => {
  const articleResponse = await request.get(
    "https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0"
  );
  const articleResponseJson = await articleResponse.json();

  expect(articleResponse.status()).toBe(200);
  expect(articleResponseJson.articlesCount).toBeLessThanOrEqual(10);
  expect(articleResponseJson.articles[0].author.username).toBe("Artem Bondar");
});

// POST
test("POST Create an Article", async ({ request }) => {
  const tokenResponse = await request.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      data: {
        user: { email: "yehorTest@gmail.com", password: "yehortest" },
      },
    }
  );

  const tokenResponseJson = await tokenResponse.json();
  expect(tokenResponse.status()).toBe(200);

  const jwtToken = tokenResponseJson.user.token;
  console.log(`The Auth token is: ${jwtToken}`);
});
