import { updateReferences } from "./update-references.js";
import type { FastifyInstance } from "fastify";
import type { OpenAPIV3_1 as OpenApi } from "openapi-types";

export type OpenAPIBaseSchema = {
  components?: OpenApi.ComponentsObject;
  externalDocs?: OpenApi.ExternalDocumentationObject;
  info: OpenApi.InfoObject;
  jsonSchemaDialect?: string;
  paths?: OpenApi.PathsObject;
  security?: OpenApi.SecurityRequirementObject[];
  servers?: OpenApi.ServerObject[];
  tags?: OpenApi.TagObject[];
  webhooks?: Record<string, OpenApi.PathItemObject | OpenApi.ReferenceObject>;
};

export function prepareBaseSchema(app: FastifyInstance, base: OpenAPIBaseSchema): OpenApi.Document {
  const { components = {}, externalDocs, info, jsonSchemaDialect, paths, security, servers, tags, webhooks } = base;
  components.schemas ??= JSON.parse(JSON.stringify(app.getSchemas(), null, 2));
  if (components.schemas) {
    for (const [_key, schema] of Object.entries(components.schemas)) {
      if ("$id" in schema) {
        delete schema.$id;
      }
      updateReferences(schema);
    }
  }
  return {
    components,
    externalDocs,
    info,
    jsonSchemaDialect,
    openapi: "3.1.0",
    paths,
    security,
    servers,
    tags,
    webhooks
  };
}
