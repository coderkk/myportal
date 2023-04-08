import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
import { api } from "../utils/api";

export const useCreateSiteProblem = () => {
  const utils = api.useContext();
  const session = useSession();
  const { mutate: createSiteProblem } =
    api.siteProblem.createSiteProblem.useMutation({
      async onMutate({ siteDiaryId, siteProblemComments }) {
        await utils.siteDiary.getSiteDiary.cancel();
        const previousData = utils.siteDiary.getSiteDiary.getData();
        utils.siteDiary.getSiteDiary.setData(
          { siteDiaryId: siteDiaryId },
          (oldSiteDiary) => {
            const optimisticUpdateObject = {
              id: Date.now().toString(),
              comments: siteProblemComments,
              siteDiaryId: siteDiaryId,
              createdBy: { name: session.data?.user?.name || "You" },
              createdById: session.data?.user?.id || Date.now().toString(),
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            if (oldSiteDiary) {
              const newSiteDiary = { ...oldSiteDiary };
              newSiteDiary.siteProblems = [
                ...newSiteDiary.siteProblems,
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
    createSiteProblem,
  };
};

export const useUpdateSiteProblem = ({
  siteDiaryId,
}: {
  siteDiaryId: string;
}) => {
  const utils = api.useContext();
  const { mutate: updateSiteProblem } =
    api.siteProblem.updateSiteProblem.useMutation({
      async onMutate({ siteProblemId, siteProblemComments }) {
        await utils.siteDiary.getSiteDiary.cancel();
        const previousData = utils.siteDiary.getSiteDiary.getData();
        utils.siteDiary.getSiteDiary.setData(
          { siteDiaryId: siteDiaryId },
          (oldSiteDiary) => {
            if (oldSiteDiary) {
              const newSiteProblems = oldSiteDiary.siteProblems.map(
                (oldSiteProblem) => {
                  return { ...oldSiteProblem };
                }
              );
              const siteProblemToUpdateIndex = newSiteProblems?.findIndex(
                (siteProblem) => siteProblem.id === siteProblemId
              );
              const updatedSiteProblem =
                newSiteProblems[siteProblemToUpdateIndex];
              if (updatedSiteProblem) {
                updatedSiteProblem.comments = siteProblemComments;
                newSiteProblems[siteProblemToUpdateIndex] = updatedSiteProblem;
              }
              const newSiteDiary = { ...oldSiteDiary };
              newSiteDiary.siteProblems = newSiteProblems;
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
      onSuccess(data, { siteProblemId, siteProblemComments }) {
        utils.siteDiary.getSiteDiary.setData(
          { siteDiaryId: siteDiaryId },
          (oldSiteDiary) => {
            if (oldSiteDiary) {
              const newSiteProblems = oldSiteDiary.siteProblems.map(
                (oldSiteProblem) => {
                  return { ...oldSiteProblem };
                }
              );
              const siteProblemToUpdateIndex = newSiteProblems?.findIndex(
                (siteProblem) => siteProblem.id === siteProblemId
              );
              const updatedSiteProblem =
                newSiteProblems[siteProblemToUpdateIndex];
              if (updatedSiteProblem) {
                updatedSiteProblem.comments = siteProblemComments;
                newSiteProblems[siteProblemToUpdateIndex] = updatedSiteProblem;
              }
              const newSiteDiary = { ...oldSiteDiary };
              newSiteDiary.siteProblems = newSiteProblems;
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
    updateSiteProblem,
  };
};

export const useDeleteSiteProblem = ({
  pendingDeleteCountRef,
  siteDiaryId,
}: {
  pendingDeleteCountRef?: MutableRefObject<number>;
  siteDiaryId: string;
}) => {
  const utils = api.useContext();
  const { mutate: deleteSiteProblem } =
    api.siteProblem.deleteSiteProblem.useMutation({
      async onMutate({ siteProblemId }) {
        if (pendingDeleteCountRef) pendingDeleteCountRef.current += 1;
        await utils.siteDiary.getSiteDiary.cancel();
        const previousData = utils.siteDiary.getSiteDiary.getData();
        utils.siteDiary.getSiteDiary.setData(
          { siteDiaryId: siteDiaryId },
          (oldSiteDiary) => {
            if (oldSiteDiary) {
              const newSiteProblems = oldSiteDiary?.siteProblems.filter(
                (oldSiteProblem) => oldSiteProblem.id !== siteProblemId
              );
              const newSiteDiary = { ...oldSiteDiary };
              newSiteDiary.siteProblems = newSiteProblems;
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
      onSuccess(data, { siteProblemId }) {
        utils.siteDiary.getSiteDiary.setData(
          { siteDiaryId: siteDiaryId },
          (oldSiteDiary) => {
            if (oldSiteDiary) {
              const newSiteProblems = oldSiteDiary?.siteProblems.filter(
                (oldSiteProblem) => oldSiteProblem.id !== siteProblemId
              );
              const newSiteDiary = { ...oldSiteDiary };
              newSiteDiary.siteProblems = newSiteProblems;
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
    deleteSiteProblem,
  };
};
