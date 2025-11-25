import { test } from "../utils/fixtures";
import { expect } from "../utils/custom-expect";
import { APILogger } from "../utils/logger";
import { createToken } from "../helpers/createToken";
import { validateSchema } from "../utils/schema-validator";
import articleRequestPayload from "../request-objects/POST-article.json";
import { faker } from '@faker-js/faker';

let authToken: string;

// We don't need to get token here anymore since RequestHandler uses default token internally
// test.beforeAll("Get Token", async ({ api, config }) => {
//   // Login and get JWT
//   authToken = await createToken(config.userEmail, config.userPassword);
// });

// Example of a smoke test using RequestHandler
test("GET All Articles", async ({ api }) => {
  const response = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  await expect(response).shouldMatchSchema("articles", "GET_articles");
  expect(response.articles.length).shouldBeLessThanOrEqual(10);
  expect(response.articlesCount).shouldEqual(response.articles.length);
});

test("GET Test Tags", async ({ api }) => {
  const response = await api.path("/tags").getRequest(200);

  await expect(response).shouldMatchSchema("tags", "GET_tags");
  expect(response.tags[0]).shouldEqual("Test");
  expect(response.tags.length).toBeLessThanOrEqual(10);
});

test("Create and Delete Article", async ({ api }) => {
  // To avoid mutation issues, we create a deep copy of the payload
  const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload));
  articleRequest.article.title = "Overrided Title - Test Article";

  // Create the article
  const createArticleResponse = await api
    .path("/articles")
    .body(articleRequest)
    .postRequest(201);

  const createdSlug = createArticleResponse.article.slug;

  expect(createArticleResponse.article.title).shouldEqual(
    "Overrided Title - Test Article"
  );

  // Verify the article exists in the list
  const listBeforeDelete = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  // Check if the created article exists
  const existsBeforeDelete = listBeforeDelete.articles.some(
    (a) => a.slug === createdSlug
  );

  expect(existsBeforeDelete).shouldEqual(true);

  // Delete the article
  await api.path(`/articles/${createdSlug}`).deleteRequest(204);

  const listAfterDelete = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  const stillExists = listAfterDelete.articles.some(
    (a) => a.slug === createdSlug
  );

  expect(stillExists).shouldEqual(false);
});

test("Create, Update and Delete Article", async ({ api }) => {
  const articleTitle = faker.lorem.sentence(5);
  // To avoid mutation issues, we create a deep copy of the payload
  const articleRequest = JSON.parse(JSON.stringify(articleRequestPayload));

  // Create the article
  const createArticleResponse = await api
    .path("/articles")
    .body(articleRequest)
    .postRequest(201);

  expect(createArticleResponse.article.title).toBe(articleTitle);

  const slug = createArticleResponse.article.slug;
  // Update the article payload
  const articleTitleUpdated = faker.lorem.sentence(5);
  articleRequest.article.title = articleTitleUpdated;

  // Update the article
  const updateArticleResponse = await api
    .path(`/articles/${slug}`)
    .body(articleRequest)
    .putRequest(200);

  expect(updateArticleResponse.article.title).toBe(articleTitleUpdated);

  const newSlugId = updateArticleResponse.article.slug;

  const articlesResponse = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  expect(articlesResponse.articles[0].title).toBe(articleTitleUpdated);

  // Delete the article
  await api.path(`/articles/${newSlugId}`).deleteRequest(204);

  const articlesResponseTwo = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  expect(articlesResponseTwo.articles[0].title).not.shouldEqual(
    "Smoke Test Article"
  );
});

test("Logger Recent Logs", async ({ api }) => {
  const logger = new APILogger();
  logger.logRequest(
    "GET",
    "https://test.com/api",
    { Authorization: "Token" },
    { foo: "bar" }
  );
  logger.logResponse(200, { foo: "bar" });
  const recentLogs = logger.getRecentLogs();
  console.log(recentLogs);
});
