import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await hash('SkysoarAdmin2023!', 12);
  
  await prisma.user.upsert({
    where: { email: 'admin@skysoar.edu.ng' },
    update: {},
    create: {
      email: 'admin@skysoar.edu.ng',
      name: 'System Administrator',
      password: hashedPassword,
      role: 'admin',
    },
  });

  // Create sample classes
  const classes = [
    { name: 'Nursery 1', level: 'nursery' },
    { name: 'Nursery 2', level: 'nursery' },
    { name: 'Primary 1', level: 'primary' },
    // Add all other classes...
  ];

  for (const cls of classes) {
    await prisma.class.upsert({
      where: { name: cls.name },
      update: {},
      create: cls,
    });
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });