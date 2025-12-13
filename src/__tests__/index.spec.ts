import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import errorPlugin from "@jafps/plugin-error";
import schemaPlugin from "@jafps/plugin-schema";
import { Validator } from "@seriousme/openapi-schema-validator";
import fastify from "fastify";
import { Type } from "typebox";
import openapiPlugin from "../index.js";
import type { FastifyInstance } from "fastify";

const bodySchema = Type.Options(Type.Object({
  a: Type.Ref("d"),
  b: Type.Options(Type.String(), { examples: ["b"] })
}), {
  $id: "b",
  description: "Description",
  examples: [{ a: "a", b: "b" }],
  title: "Title"
});

declare module "fastify" {
  interface FastifySchemas {
    b: typeof bodySchema;
  }
}

describe("@jafps/plugin-openapi", () => {
  let app: FastifyInstance;

  before(async () => {
    app = await fastify();
    await app.register(errorPlugin);
    await app.register(schemaPlugin);
    await app.register(openapiPlugin, {
      openapi: {
        info: {
          title: "API",
          version: "1.0.0"
        }
      }
    });
    app.schemas.addSchema(Type.Options(Type.String(), { $id: "d", examples: ["a"] }));
    app.schemas.addSchema(bodySchema);

    app.post("/validate", {
      schema: {
        body: Type.Ref("b"),
        response: { 200: Type.Object({ success: Type.Boolean() }) }
      }
    }, async (_req, res) => {
      res.send({ success: true });
    });

    app.post("/validate-optional", {
      schema: {
        querystring: Type.Object({
          a: Type.Optional(Type.String({ description: "2", examples: [{ value: "1" }], title: "1" })),
          b: Type.Optional(Type.Ref("d"))
        }, { title: "T" }),
        response: { 200: Type.Object({ success: Type.Boolean() }) }
      }
    }, async (_req, res) => {
      res.send({ success: true });
    });

    app.put("/no-schema", { }, async (_req, res) => {
      res.send({ success: true });
    });

    app.get("/hide", {
      config: { openapi: { hide: true } },
      schema: { response: { 200: Type.Object({ success: Type.Boolean() }) } }
    }, async (_req, res) => {
      res.send({ success: true });
    });

    app.head("/head", {
      config: { openapi: { exposeHeadRoute: true } },
      schema: {
        operationId: "a",
        response: { 200: Type.Object({ success: Type.Boolean() }) }
      }
    }, async (_req, res) => {
      res.send({ success: true });
    });

    await app.ready();
  });

  it("should produce valid OpenAPI", async () => {
    const validator = new Validator();
    const result = await validator.validate(app.openapi());
    assert.ok(result.valid, JSON.stringify(result.errors, null, 2));
    assert.equal(validator.version, "3.1");
  });

  it("should hide route", async () => {
    const json = app.openapi();
    assert.ok(!json.paths?.["/hide"]);
  });

  it("should hide untagged route", async () => {
    const app = await fastify();
    await app.register(errorPlugin);
    await app.register(schemaPlugin);
    await app.register(openapiPlugin, {
      hideUntagged: true,
      openapi: {
        info: {
          title: "API",
          version: "1.0.0"
        }
      }
    });
    app.get("/hide", { schema: { response: { 200: Type.Object({ success: Type.Boolean() }) } } }, async (_req, res) => {
      res.send({ success: true });
    });

    await app.ready();
    const json = app.openapi();
    assert.ok(!json.paths?.["/hide"]);
  });

  it("should support no schema route", async () => {
    const app = await fastify();
    await app.register(errorPlugin);
    await app.register(schemaPlugin);
    await app.register(openapiPlugin, {
      openapi: {
        info: {
          title: "API",
          version: "1.0.0"
        }
      }
    });
    app.put("/no-schema", { }, async (_req, res) => {
      res.send({ success: true });
    });

    await app.ready();
    const json = app.openapi();
    assert.ok(json.paths?.["/no-schema"]);
  });

  it("should include head route", async () => {
    const json = app.openapi();
    assert.ok(json.paths?.["/head"]);
  });

  it("should integrate with @jafps/plugin-schema", async () => {
    const res = await app.inject({
      body: {
        a: "a",
        b: 1
      },
      headers: { "content-type": "application/json" },
      method: "POST",
      path: "/validate"
    });
    const json = await res.json();
    assert.equal(res.statusCode, 422);
    assert.equal(json.success, false);
    assert.equal(json.code, "InvalidValue");
    assert.ok(json.data.message);

    const res2 = await app.inject({
      body: {
        a: "a",
        b: "b"
      },
      method: "POST",
      path: "/validate"
    });
    const json2 = await res2.json();
    assert.equal(res2.statusCode, 200);
    assert.equal(json2.success, true);
  });

  it("should integrate with @jafps/plugin-schema", async () => {
    const res = await app.inject({
      method: "POST",
      path: "/validate-optional"
    });
    const json = await res.json();
    assert.equal(res.statusCode, 200);
    assert.equal(json.success, true);
  });
});
