# @jafps/plugin-openapi

Fastify plugin for generating OpenAPI 3.1 document.

## Usage

### Register Plugin

```ts
import openapiPlugin from "@jafps/plugin-openapi";

await app.register(openapiPlugin, {
  openapi: {
    info: {
      title: "API",
      version: "1.0.0"
    }
  }
});
```

`openapi`: Basic options for OpenAPI.  
For example, `externalDocs`, `security`, `servers`, `webhooks` are not populated by this plugin.  
See [OpenAPI Specification v3.1.0][openapi] for details.

`exposeHeadRoutes`: `true` to expose `HEAD` routes. It can also be configured at route level.  
Default is `false`.

`hideUntagged`: Hide routes that have no tags.  
Default is `false`.

[openapi]: https://spec.openapis.org/oas/v3.1.0.html#openapi-object
