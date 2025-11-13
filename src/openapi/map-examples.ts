import type { OpenAPIV3_1 as OpenApi } from "openapi-types";
import type { TOptions, TSchema, TSchemaOptions } from "typebox";

type SchemaOptions = Pick<TSchemaOptions, "description" | "examples" | "title">;

export function mapExamples(opts: TOptions<TSchema, SchemaOptions>): Record<string, OpenApi.ExampleObject> | undefined {
  const { description, examples, title: summary } = opts;
  if (!examples || !Array.isArray(examples) || examples.length < 1) {
    return;
  }
  if (examples.length === 1) {
    const value = examples[0];
    return { Example: { description, summary, value } };
  }
  return examples.reduce<Record<string, OpenApi.ExampleObject>>((prev, cur, i) => {
    const value = cur;
    return {
      ...prev,
      [`Example ${i}`]: { description, summary, value }
    };
  }, {});
}
