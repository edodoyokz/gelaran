import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    select: {
      title: true,
      slug: true,
      status: true,
      isFeatured: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log('\n📊 Events in Database:\n');
  events.forEach((event, i) => {
    console.log(`${i + 1}. ${event.title}`);
    console.log(`   Slug: ${event.slug}`);
    console.log(`   Status: ${event.status}`);
    console.log(`   Featured: ${event.isFeatured ? 'Yes' : 'No'}\n`);
  });
  
  console.log(`\nTotal events: ${events.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
