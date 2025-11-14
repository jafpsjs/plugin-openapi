import fp from "fastify-plugin";
import { onRoute } from "#hook";
import { createOpenapi } from "#openapi";
import { routesSymbol } from "#symbol";
import type { OpenAPIV3_1 as OpenApi } from "openapi-types";
import type { OpenAPIBaseSchema } from "./openapi/prepare-base-schema.js";


export type OpenAPIPluginOptions = {
  exposeHeadRoutes?: boolean;
  hideUntagged?: boolean;
  openapi: OpenAPIBaseSchema;
};

export const name = "@jafps/plugin-openapi";

export default fp<OpenAPIPluginOptions>(
  async (app, opts) => {
    const {
      exposeHeadRoutes = false,
      hideUntagged = false,
      openapi
    } = opts;
    app.decorate(routesSymbol, []);
    app.addHook("onRoute", onRoute({ exposeHeadRoutes }));
    app.decorate("openapi", createOpenapi(openapi, { hideUntagged }));
  },
  {
    decorators: {},
    dependencies: [],
    fastify: "5.x",
    name
  }
);

declare module "fastify" {
  interface FastifyContextConfig {
    openapi?: {
      exposeHeadRoute?: boolean;
    };
  }

  interface FastifyInstance {
    openapi: () => OpenApi.Document;
    [routesSymbol]: RouteOptions[];
  }

  interface FastifySchema {
    consumes?: readonly string[];
    cookies?: unknown;
    deprecated?: boolean;
    description?: string;
    externalDocs?: OpenApi.ExternalDocumentationObject;
    hide?: boolean;

    /**
     * OpenAPI operation unique identifier
     */
    operationId?: string;
    produces?: readonly string[];
    security?: OpenApi.SecurityRequirementObject[];
    summary?: string;
    tags?: string[];
  }
}

declare module "typebox" {
  export interface TSchemaOptions {
    deprecated?: boolean;
    explode?: boolean;
  }
}
