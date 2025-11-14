import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldRouteHide } from "../should-route-hidden.js";

describe("shouldRouteHide", () => {
  it("should return true if hide is true", async () => {
    assert.ok(shouldRouteHide({ hide: true }, { hideUntagged: false }));
    assert.ok(shouldRouteHide({ hide: true }, { hideUntagged: true }));
  });

  it("should return true if hideUntagged is true and not tagged", async () => {
    assert.ok(shouldRouteHide({ }, { hideUntagged: true }));
    assert.ok(!shouldRouteHide({ }, { hideUntagged: false }));
    assert.ok(!shouldRouteHide({ tags: ["tag"] }, { hideUntagged: true }));
    assert.ok(!shouldRouteHide({ tags: ["tag"] }, { hideUntagged: false }));
  });
});
