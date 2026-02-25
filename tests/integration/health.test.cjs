/**
 * Integration tests for GET /api/health
 *
 * Health check route - no auth required, simple status response
 */

const test = require("node:test");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { setTestEnv, createMockRequest } = require("./setup.cjs");
const { callHandler, expectStatus, expectJson } = require("./helpers.cjs");

// Set up test environment before running tests
setTestEnv();

test("GET /api/health", async (t) => {
  // Dynamically import the route handler (ESM)
  const routePath = path.resolve(__dirname, "../../app/api/health/route.ts");
  const { GET } = await import(pathToFileURL(routePath).href);

  await t.test("should return 200 with status ok", async () => {
    const request = createMockRequest("GET", "/api/health");
    const response = await callHandler(GET, request);

    expectStatus(response, 200);
    const body = await expectJson(response);

    if (body.status !== "ok") {
      throw new Error(`Expected status "ok", got "${body.status}"`);
    }
  });

  await t.test("should not require authentication", async () => {
    // Request without any auth headers or cookies
    const request = createMockRequest("GET", "/api/health");
    const response = await callHandler(GET, request);

    // Should still return 200 (no 401)
    expectStatus(response, 200);
  });
});
