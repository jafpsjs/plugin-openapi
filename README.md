# @jafps/plugin-openapi

Fastify plugin for generating OpenAPI 3.1 document.

## Usage

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
