import { readySymbol } from "#symbol";
import type { onReadyAsyncHookHandler } from "fastify";

export const onReady: onReadyAsyncHookHandler = async function onReady() {
  this[readySymbol] = true;
};
