/**
 * Integration tests for request validation and error handling
 *
 * Note: Tests that require routes with @/lib imports (like nonce) are
 * skipped in this environment. Those are tested in E2E tests instead.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { setTestEnv, createMockRequest } = require("./setup.cjs");
const {
  callHandler,
  expectStatus,
  expectJson,
  expectStatusJson,
} = require("./helpers.cjs");

// Set up test environment before running tests
setTestEnv();

test("Health Endpoint Validation", async (t) => {
  // Test response validation using the health endpoint (no @/ imports)
  const routePath = path.resolve(__dirname, "../../app/api/health/route.ts");
  const { GET: healthGet } = await import(pathToFileURL(routePath).href);

  await t.test("should return valid JSON response", async () => {
    const request = createMockRequest("GET", "/api/health");
    const response = await callHandler(healthGet, request);

    // Verify response is valid JSON
    const body = await expectJson(response);
    assert(body, "Expected valid JSON response body");
  });

  await t.test("should have correct status codes", async () => {
    const request = createMockRequest("GET", "/api/health");
    const response = await callHandler(healthGet, request);

    expectStatus(response, 200);
  });

  await t.test("should have consistent structure", async () => {
    const request = createMockRequest("GET", "/api/health");
    const response = await callHandler(healthGet, request);

    const body = await expectStatusJson(response, 200);
    // Should have status field
    assert.equal(body.status, "ok", "Expected status field with value ok");
  });
});
