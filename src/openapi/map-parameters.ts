import { IsObject, IsOptional, IsRef, IsSchema } from "typebox";
import { IsProperties, IsRef as IsSchemaRef } from "typebox/schema";
import { mapExamples } from "./map-examples.js";
import { updateReferences } from "./update-references.js";
import type { OpenAPIV3_1 as OpenApi } from "openapi-types";
import type { TSchemaOptions } from "typebox";

export type ParameterObject = OpenApi.ParameterObject | OpenApi.ReferenceObject;

function isSchemaOptions(schema: unknown): schema is TSchemaOptions {
  return IsSchema(schema);
}

export type ParameterType = "cookie" | "header" | "path" | "query";

export type MapParametersOptions = {
  schema: unknown;
  type: ParameterType;
};

export function mapParameters(parameters: ParameterObject[], opts: MapParametersOptions): void {
  const { schema, type } = opts;
  if (!schema || (!IsObject(schema) && !IsProperties(schema))) {
    return;
  }
  for (const [key, paramSchema] of Object.entries(schema.properties)) {
    const required = type === "path" || !IsOptional(paramSchema);
    if (!isSchemaOptions(paramSchema)) {
      continue;
    }
    const { deprecated, description, examples: examplesObj, explode, title, ...otherSchema } = paramSchema;
    const examples = mapExamples(paramSchema);
    if (IsRef(paramSchema) || IsSchemaRef(paramSchema)) {
      const schema = { $ref: paramSchema.$ref };
      updateReferences(schema);
      parameters.push({
        deprecated,
        description,
        examples,
        explode,
        in: type,
        name: key,
        required,
        schema
      });
    } else if (IsSchema(paramSchema)) {
      const schema = { ...otherSchema };
      updateReferences(schema);
      parameters.push({
        deprecated,
        description,
        examples,
        explode,
        in: type,
        name: key,
        required,
        schema
      });
    }
  }
}
