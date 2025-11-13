import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Type } from "typebox";
import { Compile } from "typebox/compile";
import { mapExamples } from "../map-examples.js";

const exampleObjectSchema = Type.Record(Type.String(), Type.Object({
  description: Type.Optional(Type.String()),
  externalValue: Type.Optional(Type.String()),
  summary: Type.Optional(Type.String()),
  value: Type.Any()
}));

const validator = Compile(exampleObjectSchema);

describe("mapExamples", () => {
  it("should map to Example if there is only 1 item in examples", async () => {
    const schema = Type.Options(Type.Object({}), { examples: [{}] });
    const examples = mapExamples(schema);
    assert.ok(examples);
    assert.equal(Object.keys(examples).length, 1);
    assert.ok(examples.Example?.value);
    assert.ok(validator.Check(examples));
  });

  it("should map to multiple Example if there is multiple item in examples", async () => {
    const schema = Type.Options(Type.Object({}), { examples: [{}, {}] });
    const examples = mapExamples(schema);
    assert.ok(examples);
    assert.equal(Object.keys(examples).length, 2);
    assert.ok(Object.keys(examples).every(e => e.startsWith("Example ")));
    assert.ok(validator.Check(examples));
  });

  it("should return undefined if examples is not defined", async () => {
    const schema = Type.Options(Type.Object({}), {});
    const examples = mapExamples(schema);
    assert.equal(typeof examples, "undefined");
  });

  it("should return undefined if examples is not valid", async () => {
    const schema = Type.Options(Type.Object({}), { examples: 1 });
    const examples = mapExamples(schema);
    assert.equal(typeof examples, "undefined");
  });
});
