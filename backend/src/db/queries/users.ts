import type { Pool, PoolClient } from "pg";

type Queryable = Pool | PoolClient;

export async function getUserIdFromClerkId(
  db: Queryable,
  clerkId: string
): Promise<number | null> {
  const result = await db.query(
    "SELECT id FROM users WHERE clerk_id = $1",
    [clerkId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0].id;
}