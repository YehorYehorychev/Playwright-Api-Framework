import { test, expect, request } from "@playwright/test";

let jwtToken: string;

test.beforeAll("Run Before All", async ({ request }) => {
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
  jwtToken = (await tokenResponse.json()).user.token;
});

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
test("POST Create and DELETE an Article", async ({ request }) => {
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

  // Get all articles to confirm presence
  const allArticlesResponse = await request.get(
    "https://conduit-api.bondaracademy.com/api/articles?limit=5000&offset=0",
    {
      headers: { Authorization: `Token ${jwtToken}` },
    }
  );

  expect(allArticlesResponse.status()).toBe(200);

  const allArticlesJson = await allArticlesResponse.json();

  const foundInFullList = allArticlesJson.articles.find(
    (a: any) => a.slug === slug
  );

  expect(foundInFullList).toBeTruthy();
  console.log(`Verified article exists in full list: ${foundInFullList.title}`);

  // Delete the created article
  const deleteArticleResponse = await request.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${slug}`,
    {
      headers: { Authorization: `Token ${jwtToken}` },
    }
  );

  expect(deleteArticleResponse.status()).toBe(204);
  console.log(`Deleted article with slug: ${slug}`);
});

// ---------------------------- PUT ------------------------------------
test("CREATE, UPDATE and DELETE an Article", async ({ request }) => {
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

  // Update the created article
  const updateArticleResponse = await request.put(
    `https://conduit-api.bondaracademy.com/api/articles/${slug}`,
    {
      data: {
        article: {
          title: uniqueTitle + " - Updated",
          description: "Updated Description",
          body: "Updated description of the test article",
        },
      },
      headers: { Authorization: `Token ${jwtToken}` },
    }
  );

  expect(updateArticleResponse.status()).toBe(200);
  const updateArticleJson = await updateArticleResponse.json();

  const updatedSlug = updateArticleJson.article.slug;
  expect(updateArticleJson.article.title).toBe(uniqueTitle + " - Updated");
  console.log(`Updated article with slug: ${updatedSlug}`);

  // Verify via GET article by UPDATED slug
  const getArticleResponse = await request.get(
    `https://conduit-api.bondaracademy.com/api/articles/${updatedSlug}`
  );

  expect(getArticleResponse.status()).toBe(200);

  const getArticleJson = await getArticleResponse.json();
  expect(getArticleJson.article.title).toBe(uniqueTitle + " - Updated");
  console.log(`Verified updated article found via slug: ${updatedSlug}`);

  // Delete the created article
  const deleteArticleResponse = await request.delete(
    `https://conduit-api.bondaracademy.com/api/articles/${updatedSlug}`,
    {
      headers: { Authorization: `Token ${jwtToken}` },
    }
  );

  expect(deleteArticleResponse.status()).toBe(204);
  console.log(`Deleted article with slug: ${updatedSlug}`);
});
