import type { FastifySchema } from "fastify";

type ShouldRouteHideOptions = {
  hiddenTag: string;
  hideUntagged: boolean;
};

export function shouldRouteHide(schema: FastifySchema | undefined, opts: ShouldRouteHideOptions): boolean {
  const { hiddenTag, hideUntagged } = opts;
  if (schema?.hide) {
    return true;
  }
  const tags = schema?.tags ?? [];
  if (tags.length === 0 && hideUntagged) {
    return true;
  }
  if (tags.includes(hiddenTag)) {
    return true;
  }
  return false;
}
