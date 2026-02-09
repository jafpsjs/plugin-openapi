import { mapParameters } from "./map-parameters.js";
import { statuses } from "./status.js";
import { updateReferences } from "./update-references.js";
import type { FastifySchema } from "fastify";
import type Slugger from "github-slugger";
import type { OpenAPIV3_1 as OpenApi } from "openapi-types";

export function prepareSchemaOperation(routeSchema: FastifySchema | undefined, slugger: Slugger): OpenApi.OperationObject {
  const operation: OpenApi.OperationObject = {};
  if (!routeSchema) {
    return operation;
  }
  const schema = JSON.parse(JSON.stringify(routeSchema, null, 2)) as FastifySchema;

  operation.operationId = schema.operationId ?? slugger.slug(schema.summary ?? "operation");
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
