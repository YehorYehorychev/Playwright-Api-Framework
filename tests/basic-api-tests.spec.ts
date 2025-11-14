import { test, expect, request } from "@playwright/test";

// ---------------------------- GET ------------------------------------
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

// ---------------------------- POST ------------------------------------
test("POST Create an Article and verify via GET", async ({ request }) => {
  // Login and get JWT
  const tokenResponse = await request.post(
    "https://conduit-api.bondaracademy.com/api/users/login",
    {
      data: {
        user: { email: "yehorTest@gmail.com", password: "yehortest" },
      },
    }
  );

  expect(tokenResponse.status()).toBe(200);
  const jwtToken = (await tokenResponse.json()).user.token;
  console.log(`Obtained JWT Token: ${jwtToken}`);

  // Create unique article
  const uniqueTitle = `Yehor Test ${Date.now()}`;

  const newArticleResponse = await request.post(
    "https://conduit-api.bondaracademy.com/api/articles",
    {
      data: {
        article: {
          title: uniqueTitle,
          description: "Test Description",
          body: "description of the test article",
          tagList: ["playwright", "automation"],
        },
      },
      headers: { Authorization: `Token ${jwtToken}` },
    }
  );

  const newArticleJson = await newArticleResponse.json();
  const slug = newArticleJson.article.slug;

  expect(newArticleResponse.status()).toBe(201);
  expect(newArticleJson.article.title).toBe(uniqueTitle);
  console.log(`Created article with slug: ${slug}`);

  // Verify via GET article by SLUG
  const getArticleResponse = await request.get(
    `https://conduit-api.bondaracademy.com/api/articles/${slug}`
  );

  expect(getArticleResponse.status()).toBe(200);

  const getArticleJson = await getArticleResponse.json();

  expect(getArticleJson.article.title).toBe(uniqueTitle);
  console.log(`Verified article found via slug: ${slug}`);
});
