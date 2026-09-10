test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();
  expect(responseBody.updated_at).toBeDefined();
  expect(responseBody.dependencies.version).toBeDefined();
  expect(responseBody.dependencies.maxConnections).toBeDefined();
  expect(responseBody.dependencies.openedConnections).toBeDefined();

  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();

  expect(responseBody.dependencies.version).toBe("16.0");
  expect(responseBody.dependencies.maxConnections).toBe(100);
  expect(responseBody.dependencies.openedConnections).toBe(1);
});
