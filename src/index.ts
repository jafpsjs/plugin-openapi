import fp from "fastify-plugin";
import { onReady, onRoute } from "#hook";
import { createOpenapi } from "#openapi";
import { jsonSymbol, readySymbol, routesSymbol } from "#symbol";
import type { OpenAPIV3_1 as OpenApi } from "openapi-types";
import type { OpenAPIBaseSchema } from "./openapi/prepare-base-schema.js";

/* node:coverage disable */
export type OpenAPIPluginOptions = {
  /**
  * `true` to expose `HEAD` routes. It can also be configured at route level.
  *
  * Default is `false`.
  */
  exposeHeadRoutes?: boolean;

  /**
   * Hide routes that have no tags.
   *
   * Default is `false`.
   */
  hideUntagged?: boolean;

  /**
   * Configuration for OpenAPI
   *
   * @see https://spec.openapis.org/oas/v3.1.0.html#openapi-object
   */
  openapi: OpenAPIBaseSchema;
};

/* node:coverage enable */

export const name = "@jafps/plugin-openapi";

export default fp<OpenAPIPluginOptions>(
  async (app, opts) => {
    const {
      exposeHeadRoutes = false,
      hideUntagged = false,
      openapi
    } = opts;
    app.decorate(routesSymbol, []);
    app.decorate(readySymbol, false);
    app.decorate(jsonSymbol, null);
    app.addHook("onRoute", onRoute({ exposeHeadRoutes }));
    app.addHook("onReady", onReady);
    app.decorate("openapi", createOpenapi(openapi, { hideUntagged }));
  },
  {
    decorators: {},
    dependencies: ["@jafps/plugin-schema"],
    fastify: "5.x",
    name
  }
);

/* node:coverage disable */
declare module "fastify" {
  interface FastifyContextConfig {
    openapi?: {
      /**
      * `true` to expose `HEAD` routes. It can also be configured at route level.
      *
      * Default is `false`.
      */
      exposeHeadRoute?: boolean;

      /**
       * Hide route if it is `true`.
       *
       * Default to `false`.
       */
      hide?: boolean;
    };
  }

  interface FastifyInstance {
    [jsonSymbol]: OpenApi.Document | null;
    openapi: () => OpenApi.Document;
    [readySymbol]: boolean;
    [routesSymbol]: RouteOptions[];
  }

  interface FastifySchema {
    /**
     * MIME-types for request body.
     *
     * Default to `["application/json"]`.
     */
    consumes?: readonly string[];
    cookies?: unknown;

    /**
     * Declares this operation to be deprecated.
     *
     * Consumers SHOULD refrain from usage of the declared operation.
     *
     * Default value is `false`.
     */
    deprecated?: boolean;

    /**
     * A verbose explanation of the operation behavior.
     *
     * [CommonMark](https://spec.openapis.org/oas/v3.1.0.html#bib-commonmark) syntax MAY be used for rich text representation.
     */
    description?: string;

    /**
   * Additional external documentation.
   *
   * @see https://spec.openapis.org/oas/v3.1.0.html#external-documentation-object
   */
    externalDocs?: OpenApi.ExternalDocumentationObject;

    /**
     * Unique string used to identify the operation.
     *
     * The id MUST be unique among all operations described in the API.
     *
     * The operationId value is case-sensitive.
     *
     * Tools and libraries MAY use the operationId to uniquely identify an operation, therefore, it is RECOMMENDED to follow common programming naming conventions.
     */
    operationId?: string;

    /**
     * MIME-types for response body.
     *
     * Default to `["application/json"]`.
     */
    produces?: readonly string[];

    /**
   * A declaration of which security mechanisms can be used across the API.
   *
   * The list of values includes alternative security requirement objects that can be used.
   *
   * Only one of the security requirement objects need to be satisfied to authorize a request.
   *
   * Individual operations can override this definition.
   *
   * To make security optional, an empty security requirement (`{}`) can be included in the array.
   *
   * @see https://spec.openapis.org/oas/v3.1.0.html#security-requirement-object
   */
    security?: OpenApi.SecurityRequirementObject[];

    /**
     * A short summary of what the operation does.
     */
    summary?: string;

    /**
     * A list of tags for API documentation control.
     *
     * Tags can be used for logical grouping of operations by resources or any other qualifier.
     */
    tags?: string[];
  }
}

export type { OpenAPIBaseSchema } from "./openapi/prepare-base-schema.js";

declare module "typebox" {
  export interface TSchemaOptions {
    /**
     * Declares this operation to be deprecated.
     *
     * Consumers SHOULD refrain from usage of the declared operation.
     *
     * Default value is `false`.
     */
    deprecated?: boolean;

    /**
     * When this is true, parameter values of type `array` or `object` generate separate parameters for each value of the array or key-value pair of the map.
     *
     * For other types of parameters this property has no effect. When [style](https://spec.openapis.org/oas/v3.1.0.html#parameterStyle) is `form`, the default value is `true`.
     *
     * For all other styles, the default value is `false`.
     */
    explode?: boolean;
  }
}

/* node:coverage enable */
