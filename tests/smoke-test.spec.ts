import { test, expect } from "../utils/fixtures";
import { APILogger } from "../utils/logger";

let authToken: string;

test.beforeAll("Get Token", async ({ api }) => {
  // Login and get JWT
  const tokenResponse = await api
    .path("/users/login")
    .body({ user: { email: "yehorTest@gmail.com", password: "yehortest" } })
    .postRequest(200);

  authToken = "Token " + tokenResponse.user.token;
});

// Example of a smoke test using RequestHandler
test("GET All Articles", async ({ api }) => {
  const response = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  expect(response.articles.length).toBeLessThanOrEqual(10);
  expect(response.articlesCount).toBeGreaterThan(0);
});

test("GET Test Tags", async ({ api }) => {
  const response = await api.path("/tags").getRequest(200);

  expect(response.tags[0]).toEqual("Test");
  expect(response.tags.length).toBeLessThanOrEqual(10);
});

test("Create and Delete Article", async ({ api }) => {
  const createArticleResponse = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .body({
      article: {
        title: "Smoke Test Article",
        description: "This is a test article created during smoke testing.",
        body: "Smoke testing is essential to ensure basic functionality.",
        tagList: ["smoke", "test"],
      },
    })
    .postRequest(201);

  expect(createArticleResponse.article.title).toBe("Smoke Test Article");

  const slug = createArticleResponse.article.slug;

  const articlesResponse = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  expect(articlesResponse.articles[0].title).toBe("Smoke Test Article");

  await api
    .path(`/articles/${slug}`)
    .headers({ Authorization: authToken })
    .deleteRequest(204);

  const articlesResponseTwo = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  expect(articlesResponseTwo.articles[0].title).not.toEqual(
    "Smoke Test Article"
  );
});

test("Create, Update and Delete Article", async ({ api }) => {
  // Create the article
  const createArticleResponse = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .body({
      article: {
        title: "Smoke Test Article",
        description: "This is a test article created during smoke testing.",
        body: "Smoke testing is essential to ensure basic functionality.",
        tagList: ["smoke", "test"],
      },
    })
    .postRequest(201);

  expect(createArticleResponse.article.title).toBe("Smoke Test Article");

  const slug = createArticleResponse.article.slug;

  // Update the article
  const updateArticleResponse = await api
    .path(`/articles/${slug}`)
    .headers({ Authorization: authToken })
    .body({
      article: {
        title: "Updated Smoke Test Article",
        description:
          "This is an updated test article created during smoke testing.",
        body: "Smoke testing is essential to ensure basic functionality. This article has been updated.",
        tagList: ["smoke", "test", "updated"],
      },
    })
    .putRequest(200);

  expect(updateArticleResponse.article.title).toBe(
    "Updated Smoke Test Article"
  );

  const newSlugId = updateArticleResponse.article.slug;

  const articlesResponse = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  expect(articlesResponse.articles[0].title).toBe("Updated Smoke Test Article");

  // Delete the article
  await api
    .path(`/articles/${newSlugId}`)
    .headers({ Authorization: authToken })
    .deleteRequest(204);

  const articlesResponseTwo = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  expect(articlesResponseTwo.articles[0].title).not.toEqual(
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
