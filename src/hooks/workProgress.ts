import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
import { api } from "../utils/api";

export const useCreateWorkProgress = () => {
  const utils = api.useContext();
  const session = useSession();
  const { mutate: createWorkProgress } =
    api.workProgress.createWorkProgress.useMutation({
      async onMutate({ siteDiaryId, workProgressComments }) {
        await utils.siteDiary.getSiteDiary.cancel();
        const previousData = utils.siteDiary.getSiteDiary.getData();
        utils.siteDiary.getSiteDiary.setData(
          { siteDiaryId: siteDiaryId },
          (oldSiteDiary) => {
            const optimisticUpdateObject = {
              id: Date.now().toString(),
              comments: workProgressComments,
              siteDiaryId: siteDiaryId,
              createdBy: { name: session.data?.user?.name || "You" },
              createdById: session.data?.user?.id || Date.now().toString(),
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            if (oldSiteDiary) {
              const newSiteDiary = { ...oldSiteDiary };
              newSiteDiary.workProgresses = [
                ...newSiteDiary.workProgresses,
                optimisticUpdateObject,
              ];
              return newSiteDiary;
            } else {
              return oldSiteDiary;
            }
          }
        );
        return () =>
          utils.siteDiary.getSiteDiary.setData(
            { siteDiaryId: siteDiaryId },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      async onSettled() {
        await utils.siteDiary.getSiteDiary.invalidate();
      },
    });
  return {
    createWorkProgress,
  };
};

export const useUpdateWorkProgress = ({
  siteDiaryId,
}: {
  siteDiaryId: string;
}) => {
  const utils = api.useContext();
  const { mutate: updateWorkProgress } =
    api.workProgress.updateWorkProgress.useMutation({
      async onMutate({ workProgressId, workProgressComments }) {
        await utils.siteDiary.getSiteDiary.cancel();
        const previousData = utils.siteDiary.getSiteDiary.getData();
        utils.siteDiary.getSiteDiary.setData(
          { siteDiaryId: siteDiaryId },
          (oldSiteDiary) => {
            if (oldSiteDiary) {
              const newWorkProgresses = oldSiteDiary.workProgresses.map(
                (oldWorkProgress) => {
                  return { ...oldWorkProgress };
                }
              );
              const workProgressToUpdateIndex = newWorkProgresses?.findIndex(
                (workProgress) => workProgress.id === workProgressId
              );
              const updatedWorkProgress =
                newWorkProgresses[workProgressToUpdateIndex];
              if (updatedWorkProgress) {
                updatedWorkProgress.comments = workProgressComments;
                newWorkProgresses[workProgressToUpdateIndex] =
                  updatedWorkProgress;
              }
              const newSiteDiary = { ...oldSiteDiary };
              newSiteDiary.workProgresses = newWorkProgresses;
              return newSiteDiary;
            } else {
              return oldSiteDiary;
            }
          }
        );
        return () =>
          utils.siteDiary.getSiteDiary.setData(
            { siteDiaryId: siteDiaryId },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      onSuccess(data, { workProgressId, workProgressComments }) {
        utils.siteDiary.getSiteDiary.setData(
          { siteDiaryId: siteDiaryId },
          (oldSiteDiary) => {
            if (oldSiteDiary) {
              const newWorkProgresses = oldSiteDiary.workProgresses.map(
                (oldWorkProgress) => {
                  return { ...oldWorkProgress };
                }
              );
              const workProgressToUpdateIndex = newWorkProgresses?.findIndex(
                (workProgress) => workProgress.id === workProgressId
              );
              const updatedWorkProgress =
                newWorkProgresses[workProgressToUpdateIndex];
              if (updatedWorkProgress) {
                updatedWorkProgress.comments = workProgressComments;
                newWorkProgresses[workProgressToUpdateIndex] =
                  updatedWorkProgress;
              }
              const newSiteDiary = { ...oldSiteDiary };
              newSiteDiary.workProgresses = newWorkProgresses;
              return newSiteDiary;
            } else {
              return oldSiteDiary;
            }
          }
        );
      },
      async onSettled() {
        await utils.siteDiary.getSiteDiary.invalidate();
      },
    });
  return {
    updateWorkProgress,
  };
};

export const useDeleteWorkProgress = ({
  pendingDeleteCountRef,
  siteDiaryId,
}: {
  pendingDeleteCountRef?: MutableRefObject<number>;
  siteDiaryId: string;
}) => {
  const utils = api.useContext();
  const { mutate: deleteWorkProgress } =
    api.workProgress.deleteWorkProgress.useMutation({
      async onMutate({ workProgressId }) {
        if (pendingDeleteCountRef) pendingDeleteCountRef.current += 1;
        await utils.siteDiary.getSiteDiary.cancel();
        const previousData = utils.siteDiary.getSiteDiary.getData();
        utils.siteDiary.getSiteDiary.setData(
          { siteDiaryId: siteDiaryId },
          (oldSiteDiary) => {
            if (oldSiteDiary) {
              const newWorkProgresses = oldSiteDiary?.workProgresses.filter(
                (oldWorkProgress) => oldWorkProgress.id !== workProgressId
              );
              const newSiteDiary = { ...oldSiteDiary };
              newSiteDiary.workProgresses = newWorkProgresses;
              return newSiteDiary;
            } else {
              return oldSiteDiary;
            }
          }
        );
        return () =>
          utils.siteDiary.getSiteDiary.setData(
            { siteDiaryId: siteDiaryId },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      onSuccess(data, { workProgressId }) {
        utils.siteDiary.getSiteDiary.setData(
          { siteDiaryId: siteDiaryId },
          (oldSiteDiary) => {
            if (oldSiteDiary) {
              const newWorkProgresses = oldSiteDiary?.workProgresses.filter(
                (oldWorkProgress) => oldWorkProgress.id !== workProgressId
              );
              const newSiteDiary = { ...oldSiteDiary };
              newSiteDiary.workProgresses = newWorkProgresses;
              return newSiteDiary;
            } else {
              return oldSiteDiary;
            }
          }
        );
      },
      async onSettled() {
        if (pendingDeleteCountRef) {
          pendingDeleteCountRef.current -= 1;
          if (pendingDeleteCountRef.current === 0) {
            await utils.siteDiary.getSiteDiary.invalidate();
          }
        } else {
          await utils.siteDiary.getSiteDiary.invalidate();
        }
      },
    });
  return {
    deleteWorkProgress,
  };
};
