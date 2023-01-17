import { faker } from "@faker-js/faker";
import { MaterialUnit, WeatherCondition } from "@prisma/client";
import { env } from "../src/env/server.mjs";
import { prisma } from "../src/server/db";

async function main() {
  const userId = env.TEST_USER_ID;

  // delete all existing "projects" and "createdProjects" for userId
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      projects: {
        deleteMany: {},
      },
      createdProjects: {
        deleteMany: {},
      },
    },
  });

  // create 1 project
  const project = await prisma.project.create({
    data: {
      name: faker.company.name(),
      createdBy: {
        connect: {
          id: userId, // link "createdProjects" on the User model
        },
      },
    },
  });

  // link "projects" on the user model
  await prisma.usersOnProjects.create({
    data: {
      userId: userId,
      projectId: project.id,
    },
  });

  // create 2 site diaries and some related values
  for (let i = 0; i < 2; i++) {
    await prisma.siteDiary.create({
      data: {
        name: `Site Diary ${i}`,
        date: new Date(),
        createdBy: {
          connect: {
            id: userId,
          },
        },
        project: {
          connect: {
            id: project.id,
          },
        },
        plants: {
          create: {
            type: "Plant type",
            amount: Number(faker.random.numeric(1)),
            createdBy: {
              connect: {
                id: userId,
              },
            },
          },
        },
        weather: {
          create: {
            morning: WeatherCondition.SUNNY,
            afternoon: WeatherCondition.RAINING,
            evening: WeatherCondition.CLOUDY,
          },
        },
        laborers: {
          create: {
            type: "Laborer type",
            amount: Number(faker.random.numeric(1)),
            createdBy: {
              connect: {
                id: userId,
              },
            },
          },
        },
        materials: {
          create: {
            units: MaterialUnit.NR,
            amount: Number(faker.random.numeric(1)),
            createdBy: {
              connect: {
                id: userId,
              },
            },
          },
        },
        siteProblems: {
          create: {
            comments: faker.random.words(4),
            createdBy: {
              connect: {
                id: userId,
              },
            },
          },
        },
        workProgresses: {
          create: {
            comments: faker.random.words(4),
            createdBy: {
              connect: {
                id: userId,
              },
            },
          },
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
