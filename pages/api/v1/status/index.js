import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const versionRequest = await database.query("SHOW server_version;");

  const version = versionRequest.rows[0].server_version;

  const maxConnectionsRequest = await database.query("SHOW max_connections;");

  const maxConnections = parseInt(
    maxConnectionsRequest.rows[0].max_connections,
  );

  const databaseName = process.env.POSTGRES_DB;
  const result = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  const openedConnections = result.rows[0].count;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      version: version,
      maxConnections: maxConnections,
      openedConnections: openedConnections,
    },
  });
}

export default status;
