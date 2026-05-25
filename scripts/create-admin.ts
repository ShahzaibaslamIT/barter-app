/**
 * One-time script to create the first Super Admin account.
 * Run with: npx tsx scripts/create-admin.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@barterhub.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const name = process.env.ADMIN_NAME || "Super Admin";

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  const admin = await prisma.adminUser.create({
    data: { email, password_hash: hash, name, role: "super_admin" },
  });

  console.log(`✅ Admin created: ${admin.email} (ID: ${admin.id})`);
  console.log(`   Role: ${admin.role}`);
  console.log(`   Password: ${password}`);
  console.log(`\n⚠️  Change the password after first login!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
