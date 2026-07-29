import pkg from "pg";
const { Pool } = pkg;

const connectionString = process.env.EXTERNAL_CRM_DB || "";
console.log("🔍 [DEBUG] EXTERNAL_CRM_DB in use:", connectionString);

// 🔄 DYNAMIC CHECK: Disable SSL for local connections, enable it for hosted environments
const isLocalhost =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

const sslConfig = isLocalhost ? false : { rejectUnauthorized: false };

/**
 * Connection Pool for the External App Database
 * Uses EXTERNAL_CRM_DB environment variable
 */
const externalDb = new Pool({
  connectionString,

  // ✅ Automatically handles SSL conditionally based on environment destination
  ssl: sslConfig,

  // Pool tuning
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

/**
 * Reusable query helper for the External DB
 * Adds logging for debugging failures
 */
export const queryExternal = async (text, params) => {
  try {
    const start = Date.now();

    const res = await externalDb.query(text, params);

    const duration = Date.now() - start;
    console.log(`📦 External DB Query OK (${duration} ms)`);

    return res;
  } catch (err) {
    console.error("❌ External DB Query ERROR:");
    console.error("Query:", text);
    console.error("Params:", params);
    console.error("Message:", err.message);

    throw err; // important: let controller handle it
  }
};

/**
 * Connection lifecycle logs
 */
externalDb.on("connect", () => {
  console.log(`✅ Connected to External App Database (SSL: ${!isLocalhost})`);
});

externalDb.on("error", (err) => {
  console.error("❌ External DB Pool Error:", err.message);
});

/**
 * Test connection on startup
 */
(async () => {
  try {
    const client = await externalDb.connect();
    console.log("🚀 External DB connection test successful");
    client.release();
  } catch (err) {
    console.error("❌ External DB connection FAILED:", err.message);
  }
})();

export default externalDb;

// // import pkg from "pg";
// // const { Pool } = pkg;

// // /**
// //  * Connection Pool for the External App Database
// //  * This uses the 'EXTERNAL_CRM_DB' environment variable.
// //  */
// // const externalDb = new Pool({
// //   connectionString: process.env.EXTERNAL_CRM_DB,
// //   // Recommended production settings:
// //   max: 10, // Maximum number of clients in the pool
// //   idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
// //   connectionTimeoutMillis: 2000, // How long to wait before timing out when connecting a new client
// // });

// // /**
// //  * Reusable query helper for the External DB
// //  * @param {string} text - The SQL query
// //  * @param {array} params - Parameterized values to prevent SQL injection
// //  */
// // export const queryExternal = (text, params) => {
// //   return externalDb.query(text, params);
// // };

// // // Log successful connection or errors
// // externalDb.on("connect", () => {
// //   console.log("✅ Connected to External App Database");
// // });

// // externalDb.on("error", (err) => {
// //   console.error("❌ Unexpected error on idle External DB client", err);
// //   process.exit(-1);
// // });

// // export default externalDb;

// import pkg from "pg";
// const { Pool } = pkg;

// /**
//  * Connection Pool for the External App Database
//  * Uses EXTERNAL_CRM_DB environment variable
//  */
// const externalDb = new Pool({
//   connectionString: process.env.EXTERNAL_CRM_DB,

//   // ✅ REQUIRED for hosted DBs (Render, Supabase, Neon, etc.)
//   ssl: {
//     rejectUnauthorized: false,
//   },

//   // Pool tuning
//   max: 10,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 5000, // slightly increased for stability
// });

// /**
//  * Reusable query helper for the External DB
//  * Adds logging for debugging failures
//  */
// export const queryExternal = async (text, params) => {
//   try {
//     const start = Date.now();

//     const res = await externalDb.query(text, params);

//     const duration = Date.now() - start;
//     console.log(`📦 External DB Query OK (${duration} ms)`);

//     return res;
//   } catch (err) {
//     console.error("❌ External DB Query ERROR:");
//     console.error("Query:", text);
//     console.error("Params:", params);
//     console.error("Message:", err.message);

//     throw err; // important: let controller handle it
//   }
// };

// /**
//  * Connection lifecycle logs
//  */
// externalDb.on("connect", () => {
//   console.log("✅ Connected to External App Database");
// });

// externalDb.on("error", (err) => {
//   console.error("❌ External DB Pool Error:", err.message);
//   // ❗ Do NOT crash server in production
// });

// /**
//  * Optional: Test connection on startup
//  */
// (async () => {
//   try {
//     const client = await externalDb.connect();
//     console.log("🚀 External DB connection test successful");
//     client.release();
//   } catch (err) {
//     console.error("❌ External DB connection FAILED:", err.message);
//   }
// })();

// export default externalDb;
