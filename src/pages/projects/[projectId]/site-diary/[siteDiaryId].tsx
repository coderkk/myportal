import type {
  Laborer,
  Material,
  Plant,
  SiteProblem,
  Weather,
  WorkProgress,
} from "@prisma/client";
import * as Tabs from "@radix-ui/react-tabs";
import { type GetStaticPropsContext } from "next";
import { useRouter } from "next/router";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import { useGetSiteDiary } from "../../../../hooks/siteDiary";
import { prisma } from "../../../../server/db";

export type siteDiary = {
  weather: Weather | null;
  name: string;
  createdBy: {
    name: string | null;
  };
  plants: Plant[];
  laborers: Laborer[];
  materials: Material[];
  siteProblems: SiteProblem[];
  workProgresses: WorkProgress[];
};

const SiteDiary = ({
  siteDiaryFromStaticProps,
}: {
  siteDiaryFromStaticProps: siteDiary;
}) => {
  const router = useRouter();
  const siteDiaryId = router.query.siteDiaryId as string;
  const projectId = router.query.projectId as string;
  const { siteDiary, isError } = useGetSiteDiary({
    siteDiaryId: siteDiaryId,
    initialData: siteDiaryFromStaticProps,
  });

  if (router.isFallback) {
    return <div>Loading...</div>;
  }
  if (isError) return <div>Error!</div>;

  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        <div className="flex h-screen">
          <div className="m-auto w-10/12">
            <div className="text-lg font-medium">{siteDiary.name}</div>
            <div className="flex justify-between">
              <div>Weather condition</div>
              <div>
                <span className="mr-2">
                  Morning: {siteDiary.weather?.morning}
                </span>
                <span className="mr-2">
                  Afternoon: {siteDiary.weather?.afternoon}
                </span>
                Evening: {siteDiary.weather?.evening}
              </div>
            </div>
            <Tabs.Root
              className="flex w-2/3 flex-col shadow"
              defaultValue="tab1"
            >
              <Tabs.List
                className="flex shrink-0 border-b-2 border-solid border-gray-200"
                aria-label="Manage your account"
              >
                <Tabs.Trigger
                  className="flex flex-1 select-none items-center justify-center rounded-tl-md bg-white px-5 text-base
                   text-blue-200 hover:text-blue-500 data-[state=active]:text-blue-500 data-[state=active]:shadow-inner"
                  value="tab1"
                >
                  Plants
                </Tabs.Trigger>
                <Tabs.Trigger
                  className="flex flex-1 select-none items-center justify-center bg-white px-5 text-base text-blue-200
                  hover:text-blue-500 data-[state=active]:text-blue-500 data-[state=active]:shadow-inner"
                  value="tab2"
                >
                  Laborers
                </Tabs.Trigger>
                <Tabs.Trigger
                  className="flex flex-1 select-none items-center justify-center bg-white px-5 text-base text-blue-200
                  hover:text-blue-500 data-[state=active]:text-blue-500 data-[state=active]:shadow-inner"
                  value="tab3"
                >
                  Materials
                </Tabs.Trigger>
                <Tabs.Trigger
                  className="flex flex-1 select-none items-center justify-center bg-white px-5 text-base text-blue-200
                    hover:text-blue-500 data-[state=active]:text-blue-500 data-[state=active]:shadow-inner"
                  value="tab4"
                >
                  Work progress
                </Tabs.Trigger>
                <Tabs.Trigger
                  className="flex flex-1 select-none items-center justify-center rounded-tr-md bg-white px-5 text-base
                  text-blue-200 hover:text-blue-500 data-[state=active]:text-blue-500"
                  value="tab5"
                >
                  Site Problems
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content
                className="flex-grow rounded-bl-md rounded-br-md bg-white p-5 outline-none focus:shadow-lg"
                value="tab1"
              >
                <ul>
                  {siteDiary.plants.map((plant) => (
                    <li key={plant.id}>
                      <div>
                        <span className="mr-4">{plant.type}</span>
                        <span className="mr-4">{plant.amount}</span>
                        <span className="mr-4">{plant.createdBy.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Tabs.Content>
              <Tabs.Content
                className="flex-grow rounded-bl-md rounded-br-md bg-white p-5 outline-none focus:shadow-lg"
                value="tab2"
              >
                <ul>
                  {siteDiary.laborers.map((laborer) => (
                    <li key={laborer.id}>
                      <div>
                        <span className="mr-4">{laborer.type}</span>
                        <span className="mr-4">{laborer.amount}</span>
                        <span className="mr-4">{laborer.createdBy.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Tabs.Content>
              <Tabs.Content
                className="flex-grow rounded-bl-md rounded-br-md bg-white p-5 outline-none focus:shadow-lg"
                value="tab3"
              >
                <ul>
                  {siteDiary.materials.map((material) => (
                    <li key={material.id}>
                      <div>
                        <span className="mr-4">{material.units}</span>
                        <span className="mr-4">{material.amount}</span>
                        <span className="mr-4">{material.createdBy.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Tabs.Content>
              <Tabs.Content
                className="flex-grow rounded-bl-md rounded-br-md bg-white p-5 outline-none focus:shadow-lg"
                value="tab4"
              >
                <ul>
                  {siteDiary.siteProblems.map((siteProblem) => (
                    <li key={siteProblem.id}>
                      <div>
                        <span className="mr-4">{siteProblem.comments}</span>
                        <span className="mr-4">
                          {siteProblem.createdBy.name}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Tabs.Content>
              <Tabs.Content
                className="flex-grow rounded-bl-md rounded-br-md bg-white p-5 outline-none focus:shadow-lg"
                value="tab5"
              >
                <ul>
                  {siteDiary.workProgresses.map((workProgress) => (
                    <li key={workProgress.id}>
                      <div>
                        <span className="mr-4">{workProgress.comments}</span>
                        <span className="mr-4">
                          {workProgress.createdBy.name}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </div>
      </PermissionToProject>
    </SessionAuth>
  );
};

export async function getStaticProps(context: GetStaticPropsContext) {
  if (!context.params) {
    return {
      props: {},
    };
  }
  const siteDiary = await prisma.siteDiary.findUnique({
    where: {
      id: context.params.siteDiaryId as string,
    },
    select: {
      name: true,
      createdBy: {
        select: {
          name: true,
        },
      },
      weather: true,
      plants: {
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      },
      laborers: {
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      },
      materials: {
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      },
      siteProblems: {
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      },
      workProgresses: {
        include: {
          createdBy: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!siteDiary) {
    // https:stackoverflow.com/questions/67787456/what-is-the-difference-between-fallback-false-vs-true-vs-blocking-of-getstaticpa
    return { notFound: true };
  }

  return {
    props: {
      siteDiaryFromStaticProps: siteDiary,
    },
    revalidate: 60 * 60 * 24, // revalidate every 24 hours
  };
}

export async function getStaticPaths() {
  const siteDiaries = await prisma.siteDiary.findMany();
  const paths = siteDiaries.map((siteDiary) => ({
    params: {
      projectId: siteDiary.projectId,
      siteDiaryId: siteDiary.id,
    },
  }));
  return {
    paths: paths,
    fallback: true,
  };
}

export default SiteDiary;
