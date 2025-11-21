import fs from "fs/promises";
import path from "path";
import Ajv from "ajv";

const SCHEMA_BASE_PATH = "./response-schemas";
const ajv = new Ajv({ allErrors: true });

export async function validateSchema(
  dirName: string,
  fileName: string,
  resposeBody: object
) {
  const schemaPath = path.join(
    SCHEMA_BASE_PATH,
    dirName,
    `${fileName}_schema.json`
  );
  const schema = await loadSchema(schemaPath);
  const validate = ajv.compile(schema);

  const valid = validate(resposeBody);
  if (!valid) {
    throw new Error(
      `Schema validation failed: ${ajv.errorsText(validate.errors)}\n\n` +
        `Actual Response Body: ${JSON.stringify(resposeBody, null, 2)}`
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
