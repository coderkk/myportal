import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
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
  const { mutate: createSiteDiary } = api.siteDiary.createSiteDiary.useMutation(
    {
      async onMutate({
        projectId,
        siteDiaryName,
        siteDiaryDate,
        startDate,
        endDate,
      }) {
        await utils.siteDiary.getSiteDiaries.cancel();
        const previousData = utils.siteDiary.getSiteDiaries.getData();
        utils.siteDiary.getSiteDiaries.setData(
          {
            projectId: projectId,
            siteDiaryName: siteDiaryName,
            startDate: startDate,
            endDate: endDate,
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
              siteDiaryName: siteDiaryName,
              startDate: startDate,
              endDate: endDate,
            },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      async onSettled() {
        await utils.siteDiary.getSiteDiaries.invalidate();
      },
    }
  );
  return {
    createSiteDiary,
  };
};

export const useGetSiteDiaries = ({
  projectId,
  siteDiaryName,
  startDate,
  endDate,
}: {
  projectId: string;
  siteDiaryName: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  const { data, isLoading } = api.siteDiary.getSiteDiaries.useQuery(
    {
      projectId: projectId,
      siteDiaryName: siteDiaryName,
      startDate: startDate || new Date(Date.parse("0001-01-01T18:00:00Z")),
      endDate: endDate || new Date(Date.parse("9999-12-31T18:00:00Z")),
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
  const { mutate: updateSiteDiary } = api.siteDiary.updateSiteDiary.useMutation(
    {
      async onMutate({
        siteDiaryId,
        siteDiaryName,
        siteDiaryDate,
        startDate,
        endDate,
      }) {
        await utils.siteDiary.getSiteDiaries.cancel();
        const previousData = utils.siteDiary.getSiteDiaries.getData();
        utils.siteDiary.getSiteDiaries.setData(
          {
            projectId: projectId,
            siteDiaryName: siteDiaryName,
            startDate: startDate,
            endDate: endDate,
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
              siteDiaryName: siteDiaryName,
              startDate: startDate,
              endDate: endDate,
            },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      onSuccess(
        data,
        { siteDiaryId, siteDiaryName, siteDiaryDate, startDate, endDate }
      ) {
        utils.siteDiary.getSiteDiaries.setData(
          {
            projectId: projectId,
            siteDiaryName: siteDiaryName,
            startDate: startDate,
            endDate: endDate,
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
        await utils.siteDiary.getSiteDiaries.invalidate();
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

  const { mutate: deleteSiteDiary } = api.siteDiary.deleteSiteDiary.useMutation(
    {
      async onMutate({ siteDiaryId, siteDiaryName, startDate, endDate }) {
        if (pendingDeleteCountRef) pendingDeleteCountRef.current += 1; // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache
        await utils.siteDiary.getSiteDiaries.cancel();
        const previousData = utils.siteDiary.getSiteDiaries.getData();
        utils.siteDiary.getSiteDiaries.setData(
          {
            projectId: projectId,
            siteDiaryName: siteDiaryName,
            startDate: startDate,
            endDate: endDate,
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
              siteDiaryName: siteDiaryName,
              startDate: startDate,
              endDate: endDate,
            },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      onSuccess(data, { siteDiaryId, siteDiaryName, startDate, endDate }) {
        utils.siteDiary.getSiteDiaries.setData(
          {
            projectId: projectId,
            siteDiaryName: siteDiaryName,
            startDate: startDate,
            endDate: endDate,
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
            await utils.siteDiary.getSiteDiaries.invalidate();
          }
        } else {
          await utils.siteDiary.getSiteDiaries.invalidate();
        }
      },
    }
  );
  return {
    deleteSiteDiary,
  };
};
