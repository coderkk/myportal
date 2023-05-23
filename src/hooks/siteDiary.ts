import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
import { activeDateFiltersAtom } from "../atoms/siteDiaryAtoms";
import { activeSearchFiltersAtom } from "../atoms/taskAtoms";
import { getDateFromActiveFilter } from "../components/siteDiary/DateFilter";
import { api } from "../utils/api";

export type siteDiary = {
  id: string;
  name: string;
  date: string;
  createdBy: string | null;
};

export const useCreateSiteDiary = () => {
  const utils = api.useContext();
  const session = useSession();
  const [activeSearchFilters] = useAtom(activeSearchFiltersAtom);
  const [activeDateFilters] = useAtom(activeDateFiltersAtom);
  const { mutate: createSiteDiary } = api.siteDiary.createSiteDiary.useMutation(
    {
      async onMutate({ projectId, siteDiaryName, siteDiaryDate }) {
        await utils.siteDiary.getSiteDiaries.cancel();
        const previousData = utils.siteDiary.getSiteDiaries.getData({
          projectId: projectId,
          siteDiaryNames: activeSearchFilters.map(
            (activeSearchFilter) => activeSearchFilter.value
          ),
          startDate: getDateFromActiveFilter(true, activeDateFilters),
          endDate: getDateFromActiveFilter(false, activeDateFilters),
        });

        utils.siteDiary.getSiteDiaries.setData(
          {
            projectId: projectId,
            siteDiaryNames: activeSearchFilters.map(
              (activeSearchFilter) => activeSearchFilter.value
            ),
            startDate: getDateFromActiveFilter(true, activeDateFilters),
            endDate: getDateFromActiveFilter(false, activeDateFilters),
          },
          (oldSiteDiaries) => {
            const optimisticUpdateObject = {
              id: Date.now().toString(),
              name: siteDiaryName,
              date: siteDiaryDate,
              createdBy: { name: session.data?.user?.name || "You" },
            };
            if (oldSiteDiaries) {
              return [optimisticUpdateObject, ...oldSiteDiaries];
            } else {
              return [optimisticUpdateObject];
            }
          }
        );
        return () =>
          utils.siteDiary.getSiteDiaries.setData(
            {
              projectId: projectId,
              siteDiaryNames: activeSearchFilters.map(
                (activeSearchFilter) => activeSearchFilter.value
              ),
              startDate: getDateFromActiveFilter(true, activeDateFilters),
              endDate: getDateFromActiveFilter(false, activeDateFilters),
            },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      async onSettled(_, __, values) {
        await utils.siteDiary.getSiteDiaries.invalidate({
          projectId: values.projectId,
          siteDiaryNames: activeSearchFilters.map(
            (activeSearchFilter) => activeSearchFilter.value
          ),
          startDate: getDateFromActiveFilter(true, activeDateFilters),
          endDate: getDateFromActiveFilter(false, activeDateFilters),
        });
      },
    }
  );
  return {
    createSiteDiary,
  };
};

export const useGetSiteDiaries = ({
  projectId,
  siteDiaryNames,
  startDate,
  endDate,
}: {
  projectId: string;
  siteDiaryNames: string[];
  startDate?: Date;
  endDate?: Date;
}) => {
  const { data, isLoading } = api.siteDiary.getSiteDiaries.useQuery(
    {
      projectId: projectId,
      siteDiaryNames: siteDiaryNames,
      startDate: startDate,
      endDate: endDate,
    },
    {
      keepPreviousData: true,
    }
  );
  return {
    siteDiaries: data,
    isLoading: isLoading,
  };
};

export const useGetSiteDiary = ({ siteDiaryId }: { siteDiaryId: string }) => {
  const { data, isLoading } = api.siteDiary.getSiteDiary.useQuery({
    siteDiaryId: siteDiaryId,
  });
  return {
    siteDiary: data,
    isLoading: isLoading,
  };
};

export const useUpdateSiteDiary = ({ projectId }: { projectId: string }) => {
  const utils = api.useContext();
  const [activeSearchFilters] = useAtom(activeSearchFiltersAtom);
  const [activeDateFilters] = useAtom(activeDateFiltersAtom);
  const { mutate: updateSiteDiary } = api.siteDiary.updateSiteDiary.useMutation(
    {
      async onMutate({ siteDiaryId, siteDiaryName, siteDiaryDate }) {
        await utils.siteDiary.getSiteDiaries.cancel();
        const previousData = utils.siteDiary.getSiteDiaries.getData({
          projectId: projectId,
          siteDiaryNames: activeSearchFilters.map(
            (activeSearchFilter) => activeSearchFilter.value
          ),
          startDate: getDateFromActiveFilter(true, activeDateFilters),
          endDate: getDateFromActiveFilter(false, activeDateFilters),
        });
        utils.siteDiary.getSiteDiaries.setData(
          {
            projectId: projectId,
            siteDiaryNames: activeSearchFilters.map(
              (activeSearchFilter) => activeSearchFilter.value
            ),
            startDate: getDateFromActiveFilter(true, activeDateFilters),
            endDate: getDateFromActiveFilter(false, activeDateFilters),
          },
          (oldSiteDiaries) => {
            if (oldSiteDiaries) {
              const newSiteDiaries = oldSiteDiaries.map((oldSiteDiary) => {
                return { ...oldSiteDiary };
              });
              const siteDiaryToUpdateIndex = newSiteDiaries?.findIndex(
                (siteDiary) => siteDiary.id === siteDiaryId
              );
              const updatedSiteDiary = newSiteDiaries[siteDiaryToUpdateIndex];
              if (updatedSiteDiary) {
                updatedSiteDiary.name = siteDiaryName;
                updatedSiteDiary.date = siteDiaryDate;
                newSiteDiaries[siteDiaryToUpdateIndex] = updatedSiteDiary;
              }
              return newSiteDiaries;
            } else {
              return oldSiteDiaries;
            }
          }
        );
        return () =>
          utils.siteDiary.getSiteDiaries.setData(
            {
              projectId: projectId,
              siteDiaryNames: activeSearchFilters.map(
                (activeSearchFilter) => activeSearchFilter.value
              ),
              startDate: getDateFromActiveFilter(true, activeDateFilters),
              endDate: getDateFromActiveFilter(false, activeDateFilters),
            },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      onSuccess(data, { siteDiaryId, siteDiaryName, siteDiaryDate }) {
        utils.siteDiary.getSiteDiaries.setData(
          {
            projectId: projectId,
            siteDiaryNames: activeSearchFilters.map(
              (activeSearchFilter) => activeSearchFilter.value
            ),
            startDate: getDateFromActiveFilter(true, activeDateFilters),
            endDate: getDateFromActiveFilter(false, activeDateFilters),
          },
          (oldSiteDiaries) => {
            if (oldSiteDiaries) {
              const newSiteDiaries = oldSiteDiaries.map((oldSiteDiary) => {
                return { ...oldSiteDiary };
              });
              const siteDiaryToUpdateIndex = newSiteDiaries?.findIndex(
                (siteDiary) => siteDiary.id === siteDiaryId
              );
              const updatedSiteDiary = newSiteDiaries[siteDiaryToUpdateIndex];
              if (updatedSiteDiary) {
                updatedSiteDiary.name = siteDiaryName;
                updatedSiteDiary.date = siteDiaryDate;
                newSiteDiaries[siteDiaryToUpdateIndex] = updatedSiteDiary;
              }
              return newSiteDiaries;
            } else {
              return oldSiteDiaries;
            }
          }
        );
      },
      async onSettled() {
        await utils.siteDiary.getSiteDiaries.invalidate({
          projectId: projectId,
          siteDiaryNames: activeSearchFilters.map(
            (activeSearchFilter) => activeSearchFilter.value
          ),
          startDate: getDateFromActiveFilter(true, activeDateFilters),
          endDate: getDateFromActiveFilter(false, activeDateFilters),
        });
      },
    }
  );
  return {
    updateSiteDiary,
  };
};

export const useDeleteSiteDiary = ({
  pendingDeleteCountRef,
  projectId,
}: {
  pendingDeleteCountRef?: MutableRefObject<number>;
  projectId: string;
}) => {
  const utils = api.useContext();
  const [activeSearchFilters] = useAtom(activeSearchFiltersAtom);
  const [activeDateFilters] = useAtom(activeDateFiltersAtom);
  const { mutate: deleteSiteDiary } = api.siteDiary.deleteSiteDiary.useMutation(
    {
      async onMutate({ siteDiaryId }) {
        if (pendingDeleteCountRef) pendingDeleteCountRef.current += 1; // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache
        await utils.siteDiary.getSiteDiaries.cancel();
        const previousData = utils.siteDiary.getSiteDiaries.getData({
          projectId: projectId,
          siteDiaryNames: activeSearchFilters.map(
            (activeSearchFilter) => activeSearchFilter.value
          ),
          startDate: getDateFromActiveFilter(true, activeDateFilters),
          endDate: getDateFromActiveFilter(false, activeDateFilters),
        });
        utils.siteDiary.getSiteDiaries.setData(
          {
            projectId: projectId,
            siteDiaryNames: activeSearchFilters.map(
              (activeSearchFilter) => activeSearchFilter.value
            ),
            startDate: getDateFromActiveFilter(true, activeDateFilters),
            endDate: getDateFromActiveFilter(false, activeDateFilters),
          },
          (oldSiteDiaries) => {
            const newSiteDiaries = oldSiteDiaries?.filter(
              (newSiteDiary) => newSiteDiary.id !== siteDiaryId
            );
            return newSiteDiaries;
          }
        );
        return () =>
          utils.siteDiary.getSiteDiaries.setData(
            {
              projectId: projectId,
              siteDiaryNames: activeSearchFilters.map(
                (activeSearchFilter) => activeSearchFilter.value
              ),
              startDate: getDateFromActiveFilter(true, activeDateFilters),
              endDate: getDateFromActiveFilter(false, activeDateFilters),
            },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      onSuccess(data, { siteDiaryId }) {
        utils.siteDiary.getSiteDiaries.setData(
          {
            projectId: projectId,
            siteDiaryNames: activeSearchFilters.map(
              (activeSearchFilter) => activeSearchFilter.value
            ),
            startDate: getDateFromActiveFilter(true, activeDateFilters),
            endDate: getDateFromActiveFilter(false, activeDateFilters),
          },
          (oldSiteDiaries) => {
            const newSiteDiaries = oldSiteDiaries?.filter(
              (newSiteDiary) => newSiteDiary.id !== siteDiaryId
            );
            return newSiteDiaries;
          }
        );
      },
      async onSettled() {
        if (pendingDeleteCountRef) {
          pendingDeleteCountRef.current -= 1;
          if (pendingDeleteCountRef.current === 0) {
            await utils.siteDiary.getSiteDiaries.invalidate({
              projectId: projectId,
              siteDiaryNames: activeSearchFilters.map(
                (activeSearchFilter) => activeSearchFilter.value
              ),
              startDate: getDateFromActiveFilter(true, activeDateFilters),
              endDate: getDateFromActiveFilter(false, activeDateFilters),
            });
          }
        } else {
          await utils.siteDiary.getSiteDiaries.invalidate({
            projectId: projectId,
            siteDiaryNames: activeSearchFilters.map(
              (activeSearchFilter) => activeSearchFilter.value
            ),
            startDate: getDateFromActiveFilter(true, activeDateFilters),
            endDate: getDateFromActiveFilter(false, activeDateFilters),
          });
        }
      },
    }
  );
  return {
    deleteSiteDiary,
  };
};
