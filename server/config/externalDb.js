import pkg from "pg";
const { Pool } = pkg;

/**
 * Connection Pool for the External App Database
 * This uses the 'EXTERNAL_CRM_DB' environment variable.
 */
const externalDb = new Pool({
  connectionString: process.env.EXTERNAL_CRM_DB,
  // Recommended production settings:
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait before timing out when connecting a new client
});

/**
 * Reusable query helper for the External DB
 * @param {string} text - The SQL query
 * @param {array} params - Parameterized values to prevent SQL injection
 */
export const queryExternal = (text, params) => {
  return externalDb.query(text, params);
};

// Log successful connection or errors
externalDb.on("connect", () => {
  console.log("✅ Connected to External App Database");
});

externalDb.on("error", (err) => {
  console.error("❌ Unexpected error on idle External DB client", err);
  process.exit(-1);
});

export default externalDb;
