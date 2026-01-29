const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing database connection...');
  try {
    const result = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`;
    console.log('Tables:', result);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
