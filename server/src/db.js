import pg from "pg";
import "dotenv/config";

// DATE columns (OID 1082) default to JS Date objects, which silently shift by a
// day when the server's timezone isn't UTC. Keep them as plain 'YYYY-MM-DD'
// strings so date math in routes is explicit and timezone-independent.
pg.types.setTypeParser(1082, (value) => value);

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
