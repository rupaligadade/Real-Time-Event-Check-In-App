import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { name: "Alice", email: "alice@example.com" },
      { name: "Bob", email: "bob@example.com" }
    ],
    skipDuplicates: true
  });

  await prisma.event.createMany({
    data: [
      {
        name: "College Fest",
        location: "Main Auditorium",
        startTime: new Date("2025-10-01T14:00:00.000Z")
      },
      { 
        name: "Open Mic",
        location: "Campus Cafe",
        startTime: new Date("2025-10-05T18:00:00.000Z")
      }
    ],
    skipDuplicates: true
  });
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => process.exit(0));