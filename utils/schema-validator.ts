import fs from "fs/promises";
import path from "path";
import Ajv from "ajv";
import { createSchema } from "genson-js";

const SCHEMA_BASE_PATH = "./response-schemas";
const ajv = new Ajv({ allErrors: true });

export async function validateSchema(
  dirName: string,
  fileName: string,
  responseBody: object,
  createSchemaFlag: boolean = false
) {
  const schemaPath = path.join(
    SCHEMA_BASE_PATH,
    dirName,
    `${fileName}_schema.json`
  );

  if (createSchemaFlag) await generateNewSchema(responseBody, schemaPath);

  const schema = await loadSchema(schemaPath);
  const validate = ajv.compile(schema);

  const valid = validate(responseBody);
  if (!valid) {
    throw new Error(
      `Schema validation failed: ${ajv.errorsText(validate.errors)}\n\n` +
        `Actual Response Body: ${JSON.stringify(responseBody, null, 2)}`
    );
  }
}

async function loadSchema(schemaPath: string) {
  try {
    const schemaContent = await fs.readFile(schemaPath, "utf-8");
    return JSON.parse(schemaContent);
  } catch (error) {
    throw new Error(`Failed to load schema from ${schemaPath}: ${error}`);
  }
}

async function generateNewSchema(responseBody: object, schemaPath: string) {
  try {
    const generatedSchema = createSchema(responseBody);
    await fs.mkdir(path.dirname(schemaPath), { recursive: true });
    await fs.writeFile(schemaPath, JSON.stringify(generatedSchema, null, 2));
  } catch (error: any) {
    throw new Error(
      `Failed to create schema at ${schemaPath}: ${error.message}`
    );
  }
}
