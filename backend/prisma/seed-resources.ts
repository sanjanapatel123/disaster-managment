import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const disaster = await prisma.disaster.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!disaster) {
    throw new Error("Create a disaster before seeding resources.");
  }

  const resources = [
    {
      name: "Manhattan Emergency Shelter",
      type: "SHELTER" as const,
      location: "Manhattan, NYC",
      latitude: 40.758,
      longitude: -73.986,
      disasterId: disaster.id,
    },
    {
      name: "City Medical Center",
      type: "HOSPITAL" as const,
      location: "Midtown Manhattan, NYC",
      latitude: 40.754,
      longitude: -73.98,
      disasterId: disaster.id,
    },
    {
      name: "Far Away Rescue Center",
      type: "RESCUE" as const,
      location: "Brooklyn, NYC",
      latitude: 40.65,
      longitude: -73.95,
      disasterId: disaster.id,
    },
  ];

  for (const resource of resources) {
    await prisma.resource.create({ data: resource });
  }

  console.log(`Created ${resources.length} sample resources.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
