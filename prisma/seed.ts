import { faker } from "@faker-js/faker";
import { MaterialUnit, TaskStatus, WeatherCondition } from "@prisma/client";
import { env } from "../src/env/server.mjs";
import { prisma } from "../src/server/db";

type Budget = {
  description: string;
  expectedBudget: number;
  costsIncurred: number;
};

const range = (len: number) => {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

const newBudget = (): Budget => {
  return {
    description: faker.name.lastName(),
    expectedBudget: faker.datatype.number(999999),
    costsIncurred: faker.datatype.number(999999),
  };
};

export function makeData(samples: number) {
  return range(samples).map((): Budget => {
    return {
      ...newBudget(),
    };
  });
}

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
            afternoon: WeatherCondition.RAINY,
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
            type: "Material type",
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

  // create two tasks
  for (let i = 0; i < 2; i++) {
    await prisma.task.create({
      data: {
        description: faker.random.words(4),
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
        status: TaskStatus.NOT_STARTED,
      },
    });
  }

  // create 50 budgets
  const budgets = makeData(50);
  await prisma.budget.createMany({
    data: budgets.map((budget) => {
      return {
        ...budget,
        projectId: project.id,
        createdById: userId,
      };
    }),
  });
}

// run this for a custom db clean up
// async function cleanupDatabase() {
//   const userId = env.TEST_USER_ID;

//   // delete all existing "projects" and "createdProjects" for userId
//   await prisma.user.update({
//     where: {
//       id: userId,
//     },
//     data: {
//       projects: {
//         deleteMany: {},
//       },
//       createdProjects: {
//         deleteMany: {},
//       },
//     },
//   });
//   await prisma.siteDiary.deleteMany();
// }

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
