import articleRequestPayload from "../request-objects/POST-article.json";
import { ar, faker } from "@faker-js/faker";

export function generateRandomArticleTitle() {
  const articleRequest = structuredClone(articleRequestPayload);
  articleRequest.article.title = faker.lorem.sentence(5);
  articleRequest.article.description = faker.lorem.sentences(3);
  articleRequest.article.body = faker.lorem.paragraphs(8);
  return articleRequest;
}
