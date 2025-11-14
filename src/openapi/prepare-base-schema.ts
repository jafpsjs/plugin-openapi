import { updateReferences } from "./update-references.js";
import type { FastifyInstance } from "fastify";
import type { OpenAPIV3_1 as OpenApi } from "openapi-types";

/**
 * Configuration for OpenAPI
 *
 * @see https://spec.openapis.org/oas/v3.1.0.html#openapi-object
 */
export type OpenAPIBaseSchema = {
  /**
   * An element to hold various schemas for the document.
   *
   * Global schemas from Fastify will be added to it by {@link FastifyInstance.getSchemas}.
   *
   * @see https://spec.openapis.org/oas/v3.1.0.html#components-object
   */
  components?: OpenApi.ComponentsObject;

  /**
   * Additional external documentation.
   *
   * @see https://spec.openapis.org/oas/v3.1.0.html#external-documentation-object
   */
  externalDocs?: OpenApi.ExternalDocumentationObject;

  /**
   * Provides metadata about the API. The metadata MAY be used by tooling as required.
   *
   * @see https://spec.openapis.org/oas/v3.1.0.html#info-object
   */
  info: OpenApi.InfoObject;

  /**
   * The default value for the `$schema` keyword within [Schema Objects](https://spec.openapis.org/oas/v3.1.0.html#schema-object) contained within this OAS document.
   *
   * This MUST be in the form of a URI.
   */
  jsonSchemaDialect?: string;

  /**
   * The available paths and operations for the API.
   *
   * This plugin generates {@link OpenApi.PathsObject} from Fastify routes.
   *
   * @see https://spec.openapis.org/oas/v3.1.0.html#paths-object
   */
  paths?: OpenApi.PathsObject;

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
   * An array of Server Objects, which provide connectivity information to a target server.
   *
   * If the `servers` property is not provided, or is an empty array, the default value would be a [Server Object](https://spec.openapis.org/oas/v3.1.0.html#server-object) with a [url](https://spec.openapis.org/oas/v3.1.0.html#serverUrl) value of `/`.
   *
   * @see https://spec.openapis.org/oas/v3.1.0.html#server-object
   */
  servers?: OpenApi.ServerObject[];

  /**
   * A list of tags used by the document with additional metadata.
   *
   * The order of the tags can be used to reflect on their order by the parsing tools.
   *
   * Not all tags that are used by the [Operation Object](https://spec.openapis.org/oas/v3.1.0.html#operation-object) must be declared.
   *
   * The tags that are not declared MAY be organized randomly or based on the tools’ logic.
   *
   * Each tag name in the list MUST be unique.
   *
   * @see https://spec.openapis.org/oas/v3.1.0.html#tag-object
   */
  tags?: OpenApi.TagObject[];

  /**
   * The incoming webhooks that MAY be received as part of this API and that the API consumer MAY choose to implement.
   *
   * Closely related to the `callbacks` feature, this section describes requests initiated other than by an API call, for example by an out of band registration.
   *
   * The key name is a unique string to refer to each webhook, while the (optionally referenced) Path Item Object describes a request that may be initiated by the API provider and the expected responses.
   *
   * An [example](https://learn.openapis.org/examples/v3.1/webhook-example.html) is available.
   *
   * @see https://spec.openapis.org/oas/v3.1.0.html#path-item-object
   * @see https://spec.openapis.org/oas/v3.1.0.html#reference-object
   */
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
