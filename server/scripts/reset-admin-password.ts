import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2];
  const newPassword = process.argv[3];

  if (!username || !newPassword) {
    console.log('Usage: npx tsx scripts/reset-admin-password.ts <username> <new-password>');
    process.exit(1);
  }

  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) {
    console.log(`❌ Admin "${username}" not found`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.admin.update({
    where: { username },
    data: { passwordHash },
  });

  console.log(`✅ Password reset for "${username}"`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => prisma.$disconnect());
