const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();

  const ownerPassword = await bcrypt.hash('owner123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);

  const owner = await prisma.user.upsert({
    where: { email: 'owner@bharathydraulics.com' },
    update: {},
    create: {
      email: 'owner@bharathydraulics.com',
      name: 'Moshin Khan',
      password: ownerPassword,
      role: 'OWNER',
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@bharathydraulics.com' },
    update: {},
    create: {
      email: 'staff@bharathydraulics.com',
      name: 'Staff Member',
      password: staffPassword,
      role: 'STAFF',
    },
  });

  console.log('Seed successful:', { owner: owner.email, staff: staff.email });
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
