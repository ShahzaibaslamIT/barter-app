import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@example.com';
  const username = 'demo';
  const password = 'Passw0rd!';  // plaintext for testing
  const password_hash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      username,
      password_hash,
      user_type: 'both',  // must match your UserType enum
      phone: '555-0000',
      location_text: 'Austin, TX',
    },
    create: {
      email,
      username,
      password_hash,
      user_type: 'both',
      phone: '555-0000',
      location_text: 'Austin, TX',
    },
  });

  console.log(`✅ Seeded user: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
