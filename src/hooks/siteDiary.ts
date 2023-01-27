import { useSession } from "next-auth/react";
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
      async onMutate(values) {
        await utils.siteDiary.getSiteDiaries.cancel();
        const previousData = utils.siteDiary.getSiteDiaries.getData();
        utils.siteDiary.getSiteDiaries.setData(
          { projectId: values.projectId },
          (oldSiteDiaries) => {
            const optimisticUpdateObject = {
              id: new Date(Date.now()).toLocaleDateString(),
              name: values.siteDiaryName,
              date: new Date(Date.now()).toLocaleDateString(),
              createdBy: session.data?.user?.name || "You",
            };
            if (oldSiteDiaries) {
              return [...oldSiteDiaries, optimisticUpdateObject];
            } else {
              return [optimisticUpdateObject];
            }
          }
        );
        return () =>
          utils.siteDiary.getSiteDiaries.setData(
            { projectId: values.projectId },
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

export const useGetSiteDiaries = ({ projectId }: { projectId: string }) => {
  const { data, isLoading, isError } = api.siteDiary.getSiteDiaries.useQuery({
    projectId: projectId,
  });
  return {
    siteDiaries: data,
    isLoading: isLoading,
    isError: isError,
  };
};

export const useGetSiteDiary = ({ siteDiaryId }: { siteDiaryId: string }) => {
  const { data, isLoading, isError } = api.siteDiary.getSiteDiary.useQuery({
    siteDiaryId: siteDiaryId,
  });
  return {
    siteDiary: data,
    isLoading: isLoading,
    isError: isError,
  };
};

export const useUpdateSiteDiary = () => {
  const utils = api.useContext();
  const { mutate: updateSiteDiary } = api.siteDiary.updateSiteDiary.useMutation(
    {
      async onMutate({ siteDiaryId, siteDiaryName, projectId }) {
        await utils.siteDiary.getSiteDiaries.cancel();
        const previousData = utils.siteDiary.getSiteDiaries.getData();
        utils.siteDiary.getSiteDiaries.setData(
          { projectId: projectId },
          (oldSiteDiaries) => {
            if (oldSiteDiaries) {
              const newSiteDiaries = oldSiteDiaries.map((oldSiteDiary) => {
                return { ...oldSiteDiary };
              });
              const siteDiaryToUpdateIndex = newSiteDiaries?.findIndex(
                (siteDiary) => siteDiary.id === siteDiaryId
              );
              const updatedsiteDiary = newSiteDiaries[siteDiaryToUpdateIndex];
              if (updatedsiteDiary) {
                updatedsiteDiary.name = siteDiaryName;
                newSiteDiaries[siteDiaryToUpdateIndex] = updatedsiteDiary;
              }
              return newSiteDiaries;
            } else {
              return oldSiteDiaries;
            }
          }
        );
        return () =>
          utils.siteDiary.getSiteDiaries.setData(
            { projectId: projectId },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      onSuccess(data, { siteDiaryId, siteDiaryName, projectId }) {
        utils.siteDiary.getSiteDiaries.setData(
          { projectId: projectId },
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

export const useUpdateSiteDiaryWeather = () => {
  const { mutate: updateSiteDiaryWeather } =
    api.siteDiary.updateSiteDiaryWeather.useMutation();
  return {
    updateSiteDiaryWeather,
  };
};

export const useDeleteSiteDiary = () => {
  const utils = api.useContext();
  const { mutateAsync: deleteSiteDiary } =
    api.siteDiary.deleteSiteDiary.useMutation({
      async onMutate({ siteDiaryId, projectId }) {
        await utils.siteDiary.getSiteDiaries.cancel();
        const previousData = utils.siteDiary.getSiteDiaries.getData();
        utils.siteDiary.getSiteDiaries.setData(
          { projectId: projectId },
          (oldSiteDiaries) => {
            const newSiteDiaries = oldSiteDiaries?.filter(
              (newSiteDiary) => newSiteDiary.id !== siteDiaryId
            );
            return newSiteDiaries;
          }
        );
        return () =>
          utils.siteDiary.getSiteDiaries.setData(
            { projectId: projectId },
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
    });
  return {
    deleteSiteDiary,
  };
};
