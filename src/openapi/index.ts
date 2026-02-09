import Slugger from "github-slugger";
import { jsonSymbol, readySymbol, routesSymbol } from "#symbol";
import { formatParamUrl } from "./format-param-url.js";
import { prepareBaseSchema } from "./prepare-base-schema.js";
import { prepareSchemaOperation } from "./prepare-schema-operation.js";
import { shouldRouteHide } from "./should-route-hidden.js";
import type { FastifyInstance } from "fastify";
import type { OpenAPIV3_1 as OpenApi } from "openapi-types";
import type { OpenAPIBaseSchema } from "./prepare-base-schema.js";

/* node:coverage disable */
type CreateOpenApiOptions = {
  hideUntagged: boolean;
};

/* node:coverage enable */

export function createOpenapi(openapi: OpenAPIBaseSchema, opts: CreateOpenApiOptions): (this: FastifyInstance) => OpenApi.Document {
  const slugger = new Slugger();
  return function () {
    if (!this[readySymbol]) {
      throw new Error("openapi() can only be called after the application is ready.");
    }
    if (this[jsonSymbol]) {
      return this[jsonSymbol];
    }
    const baseDoc = prepareBaseSchema(this, openapi);
    baseDoc.paths ??= {};
    const routes = this[routesSymbol];
    for (const route of routes) {
      const { schema } = route;
      if (shouldRouteHide(schema, opts)) {
        continue;
      }
      const url = formatParamUrl(route.url);
      const schemaRoute = { ...baseDoc.paths[url] };
      const methods = typeof route.method === "string" ? [route.method] : route.method;
      const operation = prepareSchemaOperation(schema, slugger);
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
    this[jsonSymbol] = baseDoc;
    return baseDoc;
  };
}
