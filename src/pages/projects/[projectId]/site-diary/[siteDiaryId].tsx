import { Transition } from "@headlessui/react";
import type {
  Laborer,
  Material,
  Plant,
  SiteProblem,
  Weather,
  WeatherCondition,
  WorkProgress,
} from "@prisma/client";
import classNames from "classnames";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import DeleteButton from "../../../../components/siteDiary/DeleteButton";
import { LaborerView } from "../../../../components/siteDiary/laborer/LaborerView";
import { MaterialView } from "../../../../components/siteDiary/material/MaterialView";
import { PlantView } from "../../../../components/siteDiary/plant/PlantView";
import { SiteProblemView } from "../../../../components/siteDiary/siteProblem/siteProblemView";
import { WorkProgressView } from "../../../../components/siteDiary/workProgress/workProgressView";
import { useGetSiteDiary } from "../../../../hooks/siteDiary";
import { useUpdateSiteDiaryWeather } from "../../../../hooks/weather";

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

const Dropdown = dynamic(
  () => import("../../../../components/siteDiary/weather/Dropdown")
);

const CreatePlantButton = dynamic(
  () => import("../../../../components/siteDiary/plant/CreateButton")
);
const CreateLaborerButton = dynamic(
  () => import("../../../../components/siteDiary/laborer/CreateButton")
);
const CreateMaterialButton = dynamic(
  () => import("../../../../components/siteDiary/material/CreateButton")
);
const CreateSiteProblemButton = dynamic(
  () => import("../../../../components/siteDiary/siteProblem/CreateButton")
);
const CreateWorkProgressButton = dynamic(
  () => import("../../../../components/siteDiary/workProgress/CreateButton")
);

const secondaryNavigation = [
  { name: "Plants" },
  { name: "Laborers" },
  { name: "Materials" },
  { name: "Site Problems" },
  { name: "Work progress" },
];

const SiteDiary = () => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState("Plants");
  const siteDiaryId = router.query.siteDiaryId as string;
  const projectId = router.query.projectId as string;
  const { siteDiary, isLoading } = useGetSiteDiary({
    siteDiaryId: siteDiaryId,
  });
  const { updateSiteDiaryWeather } = useUpdateSiteDiaryWeather();
  const onWeatherChange = ({
    weather,
    time,
    value,
  }: {
    weather: Weather | null;
    time: string;
    value: WeatherCondition;
  }) => {
    updateSiteDiaryWeather({
      morning: time === "M" ? value : weather?.morning,
      afternoon: time === "A" ? value : weather?.afternoon,
      evening: time === "E" ? value : weather?.evening,
      siteDiaryId: siteDiaryId,
    });
  };

  const getView = (currentTab: string) => {
    switch (currentTab) {
      case "Plants":
        return <PlantView plants={siteDiary?.plants || []} />;
      case "Laborers":
        return <LaborerView laborers={siteDiary?.laborers || []} />;
      case "Materials":
        return <MaterialView materials={siteDiary?.materials || []} />;
      case "Site Problems":
        return <SiteProblemView siteProblems={siteDiary?.siteProblems || []} />;
      case "Work progress":
        return (
          <WorkProgressView workProgresses={siteDiary?.workProgresses || []} />
        );
      default:
        return <div>Not implemented</div>;
    }
  };

  const getCreateButton = (currentTab: string) => {
    switch (currentTab) {
      case "Plants":
        return <CreatePlantButton siteDiaryId={siteDiaryId} />;
      case "Laborers":
        return <CreateLaborerButton siteDiaryId={siteDiaryId} />;
      case "Materials":
        return <CreateMaterialButton siteDiaryId={siteDiaryId} />;
      case "Site Problems":
        return <CreateSiteProblemButton siteDiaryId={siteDiaryId} />;
      case "Work progress":
        return <CreateWorkProgressButton siteDiaryId={siteDiaryId} />;
      default:
        return <div>Not implemented</div>;
    }
  };

  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          siteDiary && (
            // <div className="flex h-[80vh]">
            //   <div className="m-auto w-10/12">
            //     <div className="text-lg font-medium">{siteDiary.name}</div>
            //     <div className="flex justify-between">
            //       <div>Weather condition</div>
            //       <div>
            //         <span className="mr-2">
            //           Morning:{" "}
            //           <Dropdown
            //             weatherCondition={siteDiary.weather?.morning}
            //             onWeatherChange={(value: WeatherCondition) =>
            //               onWeatherChange({
            //                 weather: siteDiary.weather,
            //                 time: "M",
            //                 value: value,
            //               })
            //             }
            //           />
            //         </span>
            //         <span className="mr-2">
            //           Afternoon:{" "}
            //           <Dropdown
            //             weatherCondition={siteDiary.weather?.afternoon}
            //             onWeatherChange={(value: WeatherCondition) =>
            //               onWeatherChange({
            //                 weather: siteDiary.weather,
            //                 time: "A",
            //                 value: value,
            //               })
            //             }
            //           />
            //         </span>
            //         Evening:
            //         <Dropdown
            //           weatherCondition={siteDiary.weather?.evening}
            //           onWeatherChange={(value: WeatherCondition) =>
            //             onWeatherChange({
            //               weather: siteDiary.weather,
            //               time: "E",
            //               value: value,
            //             })
            //           }
            //         />
            //       </div>
            //     </div>
            //     <div className="mt-2 flex justify-center">
            //       <Tabs.Root
            //         className="flex w-2/3 flex-col  shadow"
            //         defaultValue="tab1"
            //       >
            //         <Tabs.List
            //           className="flex shrink-0 border-b-2 border-solid border-gray-200"
            //           aria-label="Manage your account"
            //         >
            //           <Tabs.Trigger
            //             className="flex flex-1 select-none items-center justify-center rounded-tl-md bg-white px-5 text-base
            //       text-blue-200 hover:text-blue-500 data-[state=active]:text-blue-500 data-[state=active]:shadow-inner"
            //             value="tab1"
            //           >
            //             Plants
            //           </Tabs.Trigger>
            //           <Tabs.Trigger
            //             className="flex flex-1 select-none items-center justify-center bg-white px-5 text-base text-blue-200
            //       hover:text-blue-500 data-[state=active]:text-blue-500 data-[state=active]:shadow-inner"
            //             value="tab2"
            //           >
            //             Laborers
            //           </Tabs.Trigger>
            //           <Tabs.Trigger
            //             className="flex flex-1 select-none items-center justify-center bg-white px-5 text-base text-blue-200
            //       hover:text-blue-500 data-[state=active]:text-blue-500 data-[state=active]:shadow-inner"
            //             value="tab3"
            //           >
            //             Materials
            //           </Tabs.Trigger>
            //           <Tabs.Trigger
            //             className="flex flex-1 select-none items-center justify-center bg-white px-5 text-base text-blue-200
            //       hover:text-blue-500 data-[state=active]:text-blue-500 data-[state=active]:shadow-inner"
            //             value="tab4"
            //           >
            //             Site Problems
            //           </Tabs.Trigger>
            //           <Tabs.Trigger
            //             className="flex flex-1 select-none items-center justify-center rounded-tr-md bg-white px-5 text-base
            //       text-blue-200 hover:text-blue-500 data-[state=active]:text-blue-500 data-[state=active]:shadow-inner"
            //             value="tab5"
            //           >
            //             Work progress
            //           </Tabs.Trigger>
            //         </Tabs.List>
            //         <Tabs.Content
            //           className="flex-grow rounded-bl-md rounded-br-md bg-white p-5 focus:shadow"
            //           value="tab1"
            //         >
            //           <PlantView plants={siteDiary.plants} />
            //         </Tabs.Content>
            //         <Tabs.Content
            //           className="flex-grow rounded-bl-md rounded-br-md bg-white p-5  focus:shadow"
            //           value="tab2"
            //         >
            //           <LaborerView laborers={siteDiary.laborers} />
            //         </Tabs.Content>
            //         <Tabs.Content
            //           className="flex-grow rounded-bl-md rounded-br-md bg-white p-5  focus:shadow"
            //           value="tab3"
            //         >
            //           <MaterialView materials={siteDiary.materials} />
            //         </Tabs.Content>
            //         <Tabs.Content
            //           className="flex-grow rounded-bl-md rounded-br-md bg-white p-5 focus:shadow"
            //           value="tab4"
            //         >
            //           <SiteProblemView siteProblems={siteDiary.siteProblems} />
            //         </Tabs.Content>
            //         <Tabs.Content
            //           className="flex-grow rounded-bl-md rounded-br-md bg-white p-5 focus:shadow"
            //           value="tab5"
            //         >
            //           <WorkProgressView
            //             workProgresses={siteDiary.workProgresses}
            //           />
            //         </Tabs.Content>
            //       </Tabs.Root>
            //     </div>
            //   </div>
            // </div>
            <main>
              <h1 className="m-4">
                <span className="font-semibold text-black">
                  <div className="flex items-center justify-between gap-x-3">
                    <h1 className="flex gap-x-3 text-base leading-7">
                      <span className="text-xl text-black">
                        {siteDiary.name}
                      </span>
                    </h1>
                    <DeleteButton
                      projectId={projectId}
                      siteDiaryId={siteDiaryId}
                      navigateBack={true}
                    />
                  </div>
                </span>
              </h1>

              <header className="border-b border-white/5">
                {/* Secondary navigation */}
                <nav className="flex justify-between overflow-x-auto border-b-2 border-gray-200 py-3">
                  <Transition
                    show={true}
                    enter="transition-opacity duration-75"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <ul
                      role="list"
                      className="flex min-w-full flex-none gap-x-2 px-4 text-sm font-semibold leading-6 text-gray-400 sm:px-6 lg:px-8"
                    >
                      {secondaryNavigation.map((item, i) => (
                        <li key={item.name} className="relative flex">
                          <span
                            key={item.name}
                            tabIndex={i}
                            className={classNames(
                              currentTab === item.name
                                ? "text-gray-800"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                              " text-md whitespace-nowrap rounded-md px-2 py-2 font-normal transition-colors duration-500 ease-out hover:bg-gray-800/10"
                            )}
                            aria-current={
                              currentTab === item.name ? "page" : undefined
                            }
                            onClick={() => setCurrentTab(item.name)}
                          >
                            {item.name}
                            <span
                              className={classNames(
                                currentTab === item.name ? "bg-gray-600" : "",
                                "absolute inset-x-0 -bottom-2 h-0.5 transition-colors duration-200 ease-out sm:mt-5 sm:translate-y-px sm:transform"
                              )}
                              aria-hidden="true"
                            />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Transition>
                  <div className="mr-4 flex items-center">
                    {getCreateButton(currentTab)}
                  </div>
                </nav>
              </header>
              {getView(currentTab)}
            </main>
          )
        )}
      </PermissionToProject>
    </SessionAuth>
  );
};

export default SiteDiary;
