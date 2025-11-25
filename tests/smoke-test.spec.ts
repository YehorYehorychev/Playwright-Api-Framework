import { test } from "../utils/fixtures";
import { expect } from "../utils/custom-expect";
import { APILogger } from "../utils/logger";
import articleRequestPayload from "../request-objects/POST-article.json";
import { faker } from "@faker-js/faker";

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
  const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload));

  const title = faker.lorem.words(4);
  articleRequest.article.title = title;

  // Create
  const createArticleResponse = await api
    .path("/articles")
    .body(articleRequest)
    .postRequest(201);

  expect(createArticleResponse.article.title).shouldEqual(title);

  const createdSlug = createArticleResponse.article.slug;

  // Verify exists
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

  // Verify removed
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
//  4) CREATE + UPDATE + DELETE
//
test("Create, Update and Delete Article", async ({ api }) => {
  const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload));

  // CREATE
  const titleCreate = faker.lorem.words(5);
  articleRequest.article.title = titleCreate;

  const createArticleResponse = await api
    .path("/articles")
    .body(articleRequest)
    .postRequest(201);

  expect(createArticleResponse.article.title).shouldEqual(titleCreate);

  const slugOriginal = createArticleResponse.article.slug;

  // UPDATE
  const titleUpdated = faker.lorem.words(5);
  articleRequest.article.title = titleUpdated;

  const updateArticleResponse = await api
    .path(`/articles/${slugOriginal}`)
    .body(articleRequest)
    .putRequest(200);

  expect(updateArticleResponse.article.title).shouldEqual(titleUpdated);

  const newSlug = updateArticleResponse.article.slug;

  // VERIFY UPDATED
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
// 5) LOGGER DEMO
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
