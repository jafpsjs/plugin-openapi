import { URL } from "node:url";
import { IsArray, IsIntersect, IsObject, IsRef, IsUnion } from "typebox";
import jsonSchema from "typebox/schema";
import type { TSchema } from "typebox";
import type { XSchema } from "typebox/schema";

function isURL(input: string): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const url = new URL(input);
    return true;
  } catch {
    return false;
  }
}

function isValidReference(input: string): boolean {
  if (!input) {
    return false;
  }
  if (isURL(input) || input.startsWith("#") || input.includes("/")) {
    return false;
  }
  return true;
}
const prefix = "#/components/schemas/";

export function updateReferences(schema: TSchema | XSchema): void {
  if (typeof schema !== "object") {
    return;
  }
  if (IsRef(schema) || jsonSchema.IsRef(schema)) {
    if (isValidReference(schema.$ref)) {
      schema.$ref = `${prefix}${schema.$ref}`;
    }
    return;
  }
  if (IsArray(schema)) {
    updateReferences(schema.items);
    return;
  }
  if (jsonSchema.IsItems(schema)) {
    if (Array.isArray(schema.items)) {
      for (const item of schema.items) {
        updateReferences(item);
      }
    } else {
      updateReferences(schema.items);
    }
    return;
  }

  if (IsObject(schema) || jsonSchema.IsProperties(schema)) {
    for (const [_key, property] of Object.entries(schema.properties)) {
      updateReferences(property);
    }
    return;
  }
  if (IsUnion(schema) || jsonSchema.IsAnyOf(schema)) {
    for (const s of schema.anyOf) {
      updateReferences(s);
    }
    return;
  }
  if (IsIntersect(schema) || jsonSchema.IsAllOf(schema)) {
    for (const s of schema.allOf) {
      updateReferences(s);
    }
  }
}
