import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const prisma = new PrismaClient();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log('👤 Create New Admin\n');

  const username = await ask('Username: ');
  const password = await ask('Password: ');
  const role = await ask('Role (admin / super_admin) [admin]: ');

  if (!username || !password) {
    console.log('❌ Username and password are required');
    process.exit(1);
  }

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) {
    console.log(`❌ Admin "${username}" already exists`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.admin.create({
    data: {
      username,
      passwordHash,
      role: role || 'admin',
    },
  });

  console.log(`✅ Admin "${username}" created successfully (role: ${role || 'admin'})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); rl.close(); });
