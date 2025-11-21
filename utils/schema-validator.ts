import fs from "fs/promises";
import path from "path";

async function loadSchema(schemaPath: string) {
  try {
    const schemaContent = await fs.readFile(schemaPath, "utf-8");
    return JSON.parse(schemaContent);
  } catch (error) {
    throw new Error(`Failed to load schema from ${schemaPath}: ${error}`);
  }
}
