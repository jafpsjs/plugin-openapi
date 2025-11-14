import type { FastifySchema } from "fastify";

type ShouldRouteHideOptions = {
  hideUntagged: boolean;
};

export function shouldRouteHide(schema: FastifySchema | undefined, opts: ShouldRouteHideOptions): boolean {
  const { hideUntagged } = opts;
  if (schema?.hide) {
    return true;
  }
  const tags = schema?.tags ?? [];
  if (tags.length === 0 && hideUntagged) {
    return true;
  }
  return false;
}
