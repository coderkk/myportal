import { faker } from "@faker-js/faker";
import { MaterialUnit, TaskStatus, WeatherCondition } from "@prisma/client";
import { customAlphabet } from "nanoid";
import { prisma } from "../src/server/db";

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);

type Budget = {
  costCode: string;
  description: string;
  expectedBudget: number;
  costsIncurred: number;
  createdAt?: Date;
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
    costCode: nanoid(),
    description: faker.name.lastName(),
    expectedBudget: faker.datatype.number(999999),
    costsIncurred: faker.datatype.number(999999),
    createdAt: faker.date.past(),
  };
};

// const randomDate = (start: Date, end: Date) => {
//   return new Date(
//     start.getTime() + Math.random() * (end.getTime() - start.getTime())
//   );
// };

// const d = randomDate(new Date(2012, 0, 1), new Date());

export const makeData = (samples: number) => {
  return range(samples).map((): Budget => {
    return {
      ...newBudget(),
    };
  });
};

async function main() {
  const userId = "12jkdnavdiosu9";

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
  // await prisma.budget.deleteMany();
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
