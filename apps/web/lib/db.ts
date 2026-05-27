import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: false, // Local doesn’t need SSL
});

export default sql;
