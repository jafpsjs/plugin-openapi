import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Type } from "typebox";
import { updateReferences } from "../update-references.js";

describe("updateReferences", () => {
  it("should update ref", async () => {
    const ref = "a";
    const schema = Type.Ref(ref);
    updateReferences(schema);
    assert.equal(schema.$ref, "#/components/schemas/a");
  });

  it("should update array", async () => {
    const ref = "a";
    const schema = Type.Array(Type.Ref(ref));
    updateReferences(schema);
    assert.equal(schema.items.$ref, "#/components/schemas/a");
  });

  it("should update object", async () => {
    const ref = "a";
    const schema = Type.Object({ a: Type.Ref(ref) });
    updateReferences(schema);
    assert.equal(schema.properties.a.$ref, "#/components/schemas/a");
  });

  it("should update union", async () => {
    const ref = "a";
    const schema = Type.Union([Type.Ref(ref), Type.Object({ a: Type.Ref(ref) })]);
    updateReferences(schema);
    assert.equal(schema.anyOf[0].$ref, "#/components/schemas/a");
    assert.equal(schema.anyOf[1].properties.a.$ref, "#/components/schemas/a");
  });

  it("should update intersect", async () => {
    const ref = "a";
    const schema = Type.Intersect([Type.Ref(ref), Type.Object({ a: Type.Ref(ref) })]);
    updateReferences(schema);
    assert.equal(schema.allOf[0].$ref, "#/components/schemas/a");
    assert.equal(schema.allOf[1].properties.a.$ref, "#/components/schemas/a");
  });

  it("should not update if schema is not valid", async () => {
    const value = 1;
    updateReferences(value);
    assert.equal(value, 1);
  });

  it("should not update if reference does not exist", async () => {
    const value = {};
    updateReferences(value);
    assert.equal(Object.keys(value).length, 0);
  });

  it("should not update if reference is empty", async () => {
    const ref = "";
    const schema = Type.Ref(ref);
    updateReferences(schema);
    assert.equal(schema.$ref, ref);
  });

  it("should not update if reference is external file", async () => {
    const ref = "schemas/people/Bruce-Wayne.json";
    const schema = Type.Ref(ref);
    updateReferences(schema);
    assert.equal(schema.$ref, ref);
  });

  it("should not update if reference is sub-schema in external file", async () => {
    const ref = "schemas/places.yaml#/definitions/Gotham-City";
    const schema = Type.Ref(ref);
    updateReferences(schema);
    assert.equal(schema.$ref, ref);
  });

  it("should not update if reference is URL", async () => {
    const ref = "http://wayne-enterprises.com/things/batmobile";
    const schema = Type.Ref(ref);
    updateReferences(schema);
    assert.equal(schema.$ref, ref);
  });

  it("should not update if reference is internal", async () => {
    const ref = "#/definitions/thing/properties/colors/black-as-the-night";
    const schema = Type.Ref(ref);
    updateReferences(schema);
    assert.equal(schema.$ref, ref);
  });
});
