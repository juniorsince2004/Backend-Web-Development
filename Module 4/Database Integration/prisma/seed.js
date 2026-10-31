const prisma = require('../src/db/prisma');

async function main() {
  await prisma.$transaction(async (transaction) => {
    const author = await transaction.user.upsert({
      where: { email: 'seed-user@example.invalid' },
      update: {},
      create: { name: 'Community Seed User', email: 'seed-user@example.invalid' },
    });

    const posts = [
      { id: 1, title: 'First post', body: 'The contract survives storage changes.' },
      { id: 2, title: 'Second post', body: 'Migrations record database design.' },
    ];

    for (const post of posts) {
      await transaction.post.upsert({
        where: { id: post.id },
        update: {},
        create: { ...post, authorId: author.id },
      });
    }

    await transaction.$queryRaw`
      SELECT setval(
        pg_get_serial_sequence('"Post"', 'id'),
        COALESCE((SELECT MAX(id) FROM "Post"), 1)
      )
    `;
  });
}

main()
  .catch((error) => {
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
