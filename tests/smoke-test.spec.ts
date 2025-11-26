import { test } from "../utils/fixtures";
import { expect } from "../utils/custom-expect";
import { APILogger } from "../utils/logger";
import { generateRandomArticleRequest } from "../utils/data-generator";

test("GET All Articles", async ({ api }) => {
  const response = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  await expect(response).shouldMatchSchema("articles", "GET_articles");
  expect(response.articles.length).shouldBeLessThanOrEqual(10);
  expect(response.articlesCount).shouldEqual(response.articles.length);
  expect(response.articles.length).toBeGreaterThan(0);

  // Verify slug matches the title format
  response.articles.forEach((article: any) => {
    const titleToSlug = article.title.replace(/[,]/g, "").replace(/\s+/g, "-");
    const slugWithoutNumber = article.slug.replace(/-\d+$/, "");
    expect(slugWithoutNumber).toBe(titleToSlug);
  });
});

test("GET Test Tags", async ({ api }) => {
  const response = await api.path("/tags").getRequest(200);

  await expect(response).shouldMatchSchema("tags", "GET_tags");
  expect(response.tags.length).toBeLessThanOrEqual(10);
  expect(response.tags.length).toBeGreaterThan(0);
});

test("Create and Delete Article", async ({ api }) => {
  // Generate full random article payload
  const articleRequest = generateRandomArticleRequest();
  const title = articleRequest.article.title;

  // CREATE
  const createArticleResponse = await api
    .path("/articles")
    .body(articleRequest)
    .postRequest(201);

  await expect(createArticleResponse).shouldMatchSchema(
    "articles",
    "POST_articles"
  );
  expect(createArticleResponse.article.title).shouldEqual(title);

  const createdSlug = createArticleResponse.article.slug;

  // Verify slug matches the title format
  const titleToSlug = title.replace(/[,]/g, "").replace(/\s+/g, "-");
  const slugWithoutNumber = createdSlug.replace(/-\d+$/, "");
  expect(slugWithoutNumber).toBe(titleToSlug);

  // VERIFY EXISTS
  const listBeforeDelete = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  await expect(listBeforeDelete).shouldMatchSchema("articles", "GET_articles");
  const existsBeforeDelete = listBeforeDelete.articles.some(
    (a: any) => a.slug === createdSlug
  );

  expect(existsBeforeDelete).shouldEqual(true);

  // DELETE
  await api.path(`/articles/${createdSlug}`).deleteRequest(204);

  // VERIFY REMOVED
  const listAfterDelete = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  await expect(listAfterDelete).shouldMatchSchema("articles", "GET_articles");
  const stillExists = listAfterDelete.articles.some(
    (a: any) => a.slug === createdSlug
  );

  expect(stillExists).shouldEqual(false);
});

test("Create, Update and Delete Article", async ({ api }) => {
  // CREATE
  const createPayload = generateRandomArticleRequest();
  const titleCreate = createPayload.article.title;

  const createArticleResponse = await api
    .path("/articles")
    .body(createPayload)
    .postRequest(201);

  await expect(createArticleResponse).shouldMatchSchema(
    "articles",
    "POST_articles"
  );
  expect(createArticleResponse.article.title).shouldEqual(titleCreate);

  const slugOriginal = createArticleResponse.article.slug;

  // UPDATE
  const updatePayload = generateRandomArticleRequest();
  const titleUpdated = updatePayload.article.title;

  const updateArticleResponse = await api
    .path(`/articles/${slugOriginal}`)
    .body(updatePayload)
    .putRequest(200);

  await expect(updateArticleResponse).shouldMatchSchema(
    "articles",
    "PUT_articles"
  );
  expect(updateArticleResponse.article.title).shouldEqual(titleUpdated);

  const newSlug = updateArticleResponse.article.slug;

  // Verify slug matches the title format
  const updatedTitleToSlug = titleUpdated
    .replace(/[,]/g, "")
    .replace(/\s+/g, "-");
  const slugWithoutNumber = newSlug.replace(/-\d+$/, "");
  expect(slugWithoutNumber).toBe(updatedTitleToSlug);

  // VERIFY UPDATE
  const listAfterUpdate = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  await expect(listAfterUpdate).shouldMatchSchema("articles", "GET_articles");
  const exists = listAfterUpdate.articles.some(
    (a: any) => a.slug === newSlug && a.title === titleUpdated
  );

  expect(exists).shouldEqual(true);

  // DELETE
  await api.path(`/articles/${newSlug}`).deleteRequest(204);

  const listAfterDelete = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  await expect(listAfterDelete).shouldMatchSchema("articles", "GET_articles");
  const stillExists = listAfterDelete.articles.some(
    (a: any) => a.slug === newSlug
  );

  expect(stillExists).shouldEqual(false);
});

test("Logger Recent Logs", async () => {
  const logger = new APILogger();
  logger.logRequest(
    "GET",
    "https://test.com/api",
    { Authorization: "Token" },
    { foo: "bar" }
  );
  logger.logResponse(200, { foo: "bar" });

  console.log(logger.getRecentLogs());
});
