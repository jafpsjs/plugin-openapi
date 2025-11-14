import { routesSymbol } from "#symbol";
import { mapParameters } from "./map-parameters.js";
import { prepareBaseSchema } from "./prepare-base-schema.js";
import { shouldRouteHide } from "./should-route-hidden.js";
import { statuses } from "./status.js";
import { updateReferences } from "./update-references.js";
import type { FastifyInstance, FastifySchema } from "fastify";
import type { OpenAPIV3_1 as OpenApi } from "openapi-types";
import type { OpenAPIBaseSchema } from "./prepare-base-schema.js";


function prepareSchemaOperation(routeSchema: FastifySchema | undefined): OpenApi.OperationObject {
  const operation: OpenApi.OperationObject = {};
  if (!routeSchema) {
    return operation;
  }
  const schema = JSON.parse(JSON.stringify(routeSchema, null, 2)) as FastifySchema;

  operation.operationId = schema.operationId;
  operation.summary = schema.summary;
  operation.tags = schema.tags;
  operation.description = schema.description;
  operation.externalDocs = schema.externalDocs;
  operation.parameters ??= [];
  const consumes = schema.consumes ?? ["application/json"];
  const produces = schema.produces ?? ["application/json"];
  mapParameters(operation.parameters, { schema: schema.querystring, type: "query" });
  mapParameters(operation.parameters, { schema: schema.params, type: "path" });
  mapParameters(operation.parameters, { schema: schema.headers, type: "header" });
  mapParameters(operation.parameters, { schema: schema.cookies, type: "cookie" });
  if (schema.body) {
    const paramSchema = schema.body;
    updateReferences(paramSchema);
    operation.requestBody ??= { content: {} };
    if ("content" in operation.requestBody) {
      for (const consume of consumes) {
        operation.requestBody.content[consume] = { schema: paramSchema };
      }
    }
  }
  operation.deprecated = schema.deprecated;
  operation.security = schema.security;
  if (schema.response) {
    operation.responses ??= { };
    for (const [status, resSchema] of Object.entries(schema.response)) {
      updateReferences(resSchema);
      for (const produce of produces) {
        operation.responses[status] = {
          content: { [produce]: { schema: resSchema } },
          description: resSchema.description ?? statuses[status as any] ?? "Default Response"
        };
      }
    }
  }
  return operation;
}

/* node:coverage disable */
type CreateOpenApiOptions = {
  hideUntagged: boolean;
};

/* node:coverage enable */

export function createOpenapi(openapi: OpenAPIBaseSchema, opts: CreateOpenApiOptions): (this: FastifyInstance) => OpenApi.Document {
  return function () {
    const baseDoc = prepareBaseSchema(this, openapi);
    baseDoc.paths ??= {};
    const routes = this[routesSymbol];
    for (const route of routes) {
      const { schema, url } = route;
      if (shouldRouteHide(schema, opts)) {
        continue;
      }
      const schemaRoute = { ...baseDoc.paths[url] };
      const methods = typeof route.method === "string" ? [route.method] : route.method;
      const operation = prepareSchemaOperation(schema);
      for (const method of methods) {
        const m = method.toLowerCase();
        switch (m) {
          case "delete":
          case "get":
          case "head":
          case "options":
          case "patch":
          case "post":
          case "put":
            schemaRoute[m] = operation as any;
        }
      }
      baseDoc.paths[url] = schemaRoute;
    }
    return baseDoc;
  };
}
