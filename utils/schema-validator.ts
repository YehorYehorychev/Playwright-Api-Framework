import fs from "fs/promises";
import path from "path";
import Ajv from "ajv";
import { createSchema } from "genson-js";
import addFormats from "ajv-formats";

const SCHEMA_BASE_PATH = "./response-schemas";
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

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
    let generatedSchema = createSchema(responseBody);

    // Add date-time format to createdAt and updatedAt properties
    generatedSchema = addDateTimeFormat(generatedSchema);

    await fs.mkdir(path.dirname(schemaPath), { recursive: true });
    await fs.writeFile(schemaPath, JSON.stringify(generatedSchema, null, 2));
  } catch (error: any) {
    throw new Error(
      `Failed to create schema at ${schemaPath}: ${error.message}`
    );
  }
}

function addDateTimeFormat(schema: any): any {
  if (schema.properties) {
    if (
      schema.properties.createdAt &&
      schema.properties.createdAt.type === "string"
    ) {
      schema.properties.createdAt.format = "date-time";
    }
    if (
      schema.properties.updatedAt &&
      schema.properties.updatedAt.type === "string"
    ) {
      schema.properties.updatedAt.format = "date-time";
    }

    // Recursively check nested objects and array items
    for (const key in schema.properties) {
      const prop = schema.properties[key];

      // Handle nested objects
      if (prop.type === "object" && prop.properties) {
        addDateTimeFormat(prop);
      }

      // Handle array items
      if (prop.type === "array" && prop.items) {
        if (prop.items.type === "object" && prop.items.properties) {
          addDateTimeFormat(prop.items);
        }
      }
    }
  }

  return schema;
}
