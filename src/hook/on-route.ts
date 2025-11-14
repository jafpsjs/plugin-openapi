import { routesSymbol } from "#symbol";
import type { onRouteHookHandler } from "fastify";

export type OnRouteOptions = {
  exposeHeadRoutes: boolean;
};

export function onRoute(opts: OnRouteOptions): onRouteHookHandler {
  const { exposeHeadRoutes } = opts;
  return async function (routeOptions) {
    const routeConfig = routeOptions.config ?? {};
    const openapiConfig = routeConfig.openapi ?? {};
    if (routeOptions.method === "HEAD" && !exposeHeadRoutes && openapiConfig.exposeHeadRoute !== true) {
      return;
    }
    if (openapiConfig.hide) {
      return;
    }
    if (
      routeOptions.method === "HEAD"
      && routeOptions.schema?.operationId !== undefined
    ) {
      // If two routes with operationId are added to the swagger
      // object, it is no longer valid.
      // therefore we suffix the operationId with `-head`.
      this[routesSymbol].push({
        ...routeOptions,
        schema: { ...routeOptions.schema, operationId: `${routeOptions.schema.operationId}-head` }
      });
      return;
    }
    this[routesSymbol].push(routeOptions);
  };
}
