import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldRouteHide } from "../should-route-hidden.js";

describe("shouldRouteHide", () => {
  it("should return true if hide is true", async () => {
    assert.ok(shouldRouteHide({ hide: true }, { hiddenTag: "X-hidden", hideUntagged: false }));
    assert.ok(shouldRouteHide({ hide: true }, { hiddenTag: "X-hidden", hideUntagged: true }));
  });

  it("should return true if hideUntagged is true and not tagged", async () => {
    assert.ok(shouldRouteHide({ }, { hiddenTag: "X-hidden", hideUntagged: true }));
    assert.ok(!shouldRouteHide({ }, { hiddenTag: "X-hidden", hideUntagged: false }));
    assert.ok(!shouldRouteHide({ tags: ["tag"] }, { hiddenTag: "X-hidden", hideUntagged: true }));
    assert.ok(!shouldRouteHide({ tags: ["tag"] }, { hiddenTag: "X-hidden", hideUntagged: false }));
  });

  it("should return true if hiddenTag is included in tags", async () => {
    assert.ok(shouldRouteHide({ tags: ["X-hidden"] }, { hiddenTag: "X-hidden", hideUntagged: true }));
    assert.ok(!shouldRouteHide({ tags: ["tag"] }, { hiddenTag: "X-hidden", hideUntagged: false }));
  });
});
