import type { FastifySchema } from "fastify";

/* node:coverage disable */
type ShouldRouteHideOptions = {
  hideUntagged: boolean;
};

/* node:coverage enable */

export function shouldRouteHide(schema: FastifySchema | undefined, opts: ShouldRouteHideOptions): boolean {
  const { hideUntagged } = opts;
  const tags = schema?.tags ?? [];
  if (tags.length === 0 && hideUntagged) {
    return true;
  }
  return false;
}
