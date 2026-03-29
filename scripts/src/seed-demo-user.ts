import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

const DEMO_EMAIL = "demo@prepflo.com";
const DEMO_PASSWORD = "PrepFlo2026!";

async function main() {
  console.log("Seeding demo user...");

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, DEMO_EMAIL))
    .limit(1);

  if (existing) {
    console.log(`Demo user already exists (id: ${existing.id}) — nothing to do.`);
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const [user] = await db
    .insert(usersTable)
    .values({ email: DEMO_EMAIL, passwordHash })
    .returning({ id: usersTable.id, email: usersTable.email });

  console.log(`Demo user created: ${user.email} (id: ${user.id})`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
