import type {
  Laborer,
  Material,
  Plant,
  SiteProblem,
  Weather,
  WeatherCondition,
  WorkProgress,
} from "@prisma/client";
import * as Tabs from "@radix-ui/react-tabs";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import SessionAuth from "../../../../components/auth/SessionAuth";
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

const SiteDiary = () => {
  const router = useRouter();
  const siteDiaryId = router.query.siteDiaryId as string;
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
  return (
    <SessionAuth>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        siteDiary && (
          <div className="flex h-[80vh]">
            <div className="m-auto w-10/12">
              <div className="text-lg font-medium">{siteDiary.name}</div>
              <div className="flex justify-between">
                <div>Weather condition</div>
                <div>
                  <span className="mr-2">
                    Morning:{" "}
                    <Dropdown
                      weatherCondition={siteDiary.weather?.morning}
                      onWeatherChange={(value: WeatherCondition) =>
                        onWeatherChange({
                          weather: siteDiary.weather,
                          time: "M",
                          value: value,
                        })
                      }
                    />
                  </span>
                  <span className="mr-2">
                    Afternoon:{" "}
                    <Dropdown
                      weatherCondition={siteDiary.weather?.afternoon}
                      onWeatherChange={(value: WeatherCondition) =>
                        onWeatherChange({
                          weather: siteDiary.weather,
                          time: "A",
                          value: value,
                        })
                      }
                    />
                  </span>
                  Evening:
                  <Dropdown
                    weatherCondition={siteDiary.weather?.evening}
                    onWeatherChange={(value: WeatherCondition) =>
                      onWeatherChange({
                        weather: siteDiary.weather,
                        time: "E",
                        value: value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="mt-2 flex justify-center">
                <Tabs.Root
                  className="flex w-2/3 flex-col  shadow"
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
                      Site Problems
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      className="flex flex-1 select-none items-center justify-center rounded-tr-md bg-white px-5 text-base
                  text-blue-200 hover:text-blue-500 data-[state=active]:text-blue-500 data-[state=active]:shadow-inner"
                      value="tab5"
                    >
                      Work progress
                    </Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content
                    className="flex-grow rounded-bl-md rounded-br-md bg-white p-5 focus:shadow"
                    value="tab1"
                  >
                    <PlantView plants={siteDiary.plants} />
                  </Tabs.Content>
                  <Tabs.Content
                    className="flex-grow rounded-bl-md rounded-br-md bg-white p-5  focus:shadow"
                    value="tab2"
                  >
                    <LaborerView laborers={siteDiary.laborers} />
                  </Tabs.Content>
                  <Tabs.Content
                    className="flex-grow rounded-bl-md rounded-br-md bg-white p-5  focus:shadow"
                    value="tab3"
                  >
                    <MaterialView materials={siteDiary.materials} />
                  </Tabs.Content>
                  <Tabs.Content
                    className="flex-grow rounded-bl-md rounded-br-md bg-white p-5 focus:shadow"
                    value="tab4"
                  >
                    <SiteProblemView siteProblems={siteDiary.siteProblems} />
                  </Tabs.Content>
                  <Tabs.Content
                    className="flex-grow rounded-bl-md rounded-br-md bg-white p-5 focus:shadow"
                    value="tab5"
                  >
                    <WorkProgressView
                      workProgresses={siteDiary.workProgresses}
                    />
                  </Tabs.Content>
                </Tabs.Root>
              </div>
            </div>
          </div>
        )
      )}
    </SessionAuth>
  );
};

export default SiteDiary;
