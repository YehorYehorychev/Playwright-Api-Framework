import { test } from "../utils/fixtures";
import { expect } from "../utils/custom-expect";
import { APILogger } from "../utils/logger";
import { generateRandomArticleRequest } from "../utils/data-generator";

//
//  1) GET ALL ARTICLES
//
test("GET All Articles", async ({ api }) => {
  const response = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  await expect(response).shouldMatchSchema("articles", "GET_articles");
  expect(response.articles.length).shouldBeLessThanOrEqual(10);
  expect(response.articlesCount).shouldEqual(response.articles.length);
});

//
//  2) GET TAGS
//
test("GET Test Tags", async ({ api }) => {
  const response = await api.path("/tags").getRequest(200);

  await expect(response).shouldMatchSchema("tags", "GET_tags");
  expect(response.tags.length).toBeLessThanOrEqual(10);
});

//
//  3) CREATE + DELETE ARTICLE
//
test("Create and Delete Article", async ({ api }) => {
  // Generate full random article payload
  const articleRequest = generateRandomArticleRequest();
  const title = articleRequest.article.title;

  // CREATE
  const createArticleResponse = await api
    .path("/articles")
    .body(articleRequest)
    .postRequest(201);

  expect(createArticleResponse.article.title).shouldEqual(title);

  const createdSlug = createArticleResponse.article.slug;

  // VERIFY EXISTS
  const listBeforeDelete = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  const existsBeforeDelete = listBeforeDelete.articles.some(
    (a) => a.slug === createdSlug
  );

  expect(existsBeforeDelete).shouldEqual(true);

  // DELETE
  await api.path(`/articles/${createdSlug}`).deleteRequest(204);

  // VERIFY REMOVED
  const listAfterDelete = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  const stillExists = listAfterDelete.articles.some(
    (a) => a.slug === createdSlug
  );

  expect(stillExists).shouldEqual(false);
});

//
//  4) CREATE + UPDATE + DELETE ARTICLE
//
test("Create, Update and Delete Article", async ({ api }) => {
  // CREATE
  const createPayload = generateRandomArticleRequest();
  const titleCreate = createPayload.article.title;

  const createArticleResponse = await api
    .path("/articles")
    .body(createPayload)
    .postRequest(201);

  expect(createArticleResponse.article.title).shouldEqual(titleCreate);

  const slugOriginal = createArticleResponse.article.slug;

  // UPDATE
  const updatePayload = generateRandomArticleRequest();
  const titleUpdated = updatePayload.article.title;

  const updateArticleResponse = await api
    .path(`/articles/${slugOriginal}`)
    .body(updatePayload)
    .putRequest(200);

  expect(updateArticleResponse.article.title).shouldEqual(titleUpdated);

  const newSlug = updateArticleResponse.article.slug;

  // VERIFY UPDATE
  const listAfterUpdate = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  const exists = listAfterUpdate.articles.some(
    (a) => a.slug === newSlug && a.title === titleUpdated
  );

  expect(exists).shouldEqual(true);

  // DELETE
  await api.path(`/articles/${newSlug}`).deleteRequest(204);

  const listAfterDelete = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  const stillExists = listAfterDelete.articles.some((a) => a.slug === newSlug);

  expect(stillExists).shouldEqual(false);
});

//
//  5) LOGGER DEMO
//
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
