import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
import { api } from "../utils/api";

export const useCreateLaborer = () => {
  const utils = api.useContext();
  const session = useSession();
  const { mutate: createLaborer } = api.laborer.createLaborer.useMutation({
    async onMutate({ laborerType, siteDiaryId, laborerAmount }) {
      await utils.siteDiary.getSiteDiary.cancel();
      const previousData = utils.siteDiary.getSiteDiary.getData();
      utils.siteDiary.getSiteDiary.setData(
        { siteDiaryId: siteDiaryId },
        (oldSiteDiary) => {
          const optimisticUpdateObject = {
            id: Date.now().toString(),
            type: laborerType,
            amount: laborerAmount,
            siteDiaryId: siteDiaryId,
            createdBy: { name: session.data?.user?.name || "You" },
            createdById: session.data?.user?.id || Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          if (oldSiteDiary) {
            const newSiteDiary = { ...oldSiteDiary };
            newSiteDiary.laborers = [
              ...newSiteDiary.laborers,
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
    createLaborer,
  };
};

export const useUpdateLaborer = ({ siteDiaryId }: { siteDiaryId: string }) => {
  const utils = api.useContext();
  const { mutate: updateLaborer } = api.laborer.updateLaborer.useMutation({
    async onMutate({ laborerId, laborerType, laborerAmount }) {
      await utils.siteDiary.getSiteDiary.cancel();
      const previousData = utils.siteDiary.getSiteDiary.getData();
      utils.siteDiary.getSiteDiary.setData(
        { siteDiaryId: siteDiaryId },
        (oldSiteDiary) => {
          if (oldSiteDiary) {
            const newLaborers = oldSiteDiary.laborers.map((oldLaborer) => {
              return { ...oldLaborer };
            });
            const laborerToUpdateIndex = newLaborers?.findIndex(
              (laborer) => laborer.id === laborerId
            );
            const updatedLaborer = newLaborers[laborerToUpdateIndex];
            if (updatedLaborer) {
              updatedLaborer.type = laborerType;
              updatedLaborer.amount = laborerAmount;
              newLaborers[laborerToUpdateIndex] = updatedLaborer;
            }
            const newSiteDiary = { ...oldSiteDiary };
            newSiteDiary.laborers = newLaborers;
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
    onSuccess(data, { laborerId, laborerType, laborerAmount }) {
      utils.siteDiary.getSiteDiary.setData(
        { siteDiaryId: siteDiaryId },
        (oldSiteDiary) => {
          if (oldSiteDiary) {
            const newLaborers = oldSiteDiary.laborers.map((oldLaborer) => {
              return { ...oldLaborer };
            });
            const laborerToUpdateIndex = newLaborers?.findIndex(
              (laborer) => laborer.id === laborerId
            );
            const updatedLaborer = newLaborers[laborerToUpdateIndex];
            if (updatedLaborer) {
              updatedLaborer.type = laborerType;
              updatedLaborer.amount = laborerAmount;
              newLaborers[laborerToUpdateIndex] = updatedLaborer;
            }
            const newSiteDiary = { ...oldSiteDiary };
            newSiteDiary.laborers = newLaborers;
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
    updateLaborer,
  };
};

export const useDeleteLaborer = ({
  pendingDeleteCountRef,
  siteDiaryId,
}: {
  pendingDeleteCountRef?: MutableRefObject<number>;
  siteDiaryId: string;
}) => {
  const utils = api.useContext();
  const { mutate: deleteLaborer } = api.laborer.deleteLaborer.useMutation({
    async onMutate({ laborerId }) {
      if (pendingDeleteCountRef) pendingDeleteCountRef.current += 1;
      await utils.siteDiary.getSiteDiary.cancel();
      const previousData = utils.siteDiary.getSiteDiary.getData();
      utils.siteDiary.getSiteDiary.setData(
        { siteDiaryId: siteDiaryId },
        (oldSiteDiary) => {
          if (oldSiteDiary) {
            const newLaborers = oldSiteDiary?.laborers.filter(
              (oldLaborer) => oldLaborer.id !== laborerId
            );
            const newSiteDiary = { ...oldSiteDiary };
            newSiteDiary.laborers = newLaborers;
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
    onSuccess(data, { laborerId }) {
      utils.siteDiary.getSiteDiary.setData(
        { siteDiaryId: siteDiaryId },
        (oldSiteDiary) => {
          if (oldSiteDiary) {
            const newLaborers = oldSiteDiary?.laborers.filter(
              (oldLaborer) => oldLaborer.id !== laborerId
            );
            const newSiteDiary = { ...oldSiteDiary };
            newSiteDiary.laborers = newLaborers;
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
    deleteLaborer,
  };
};
