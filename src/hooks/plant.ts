import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
import { api } from "../utils/api";

export const useCreatePlant = () => {
  const utils = api.useContext();
  const session = useSession();
  const { mutate: createPlant } = api.plant.createPlant.useMutation({
    async onMutate({ plantType, siteDiaryId, plantAmount }) {
      await utils.siteDiary.getSiteDiary.cancel();
      const previousData = utils.siteDiary.getSiteDiary.getData();
      utils.siteDiary.getSiteDiary.setData(
        { siteDiaryId: siteDiaryId },
        (oldSiteDiary) => {
          const optimisticUpdateObject = {
            id: Date.now().toString(),
            type: plantType,
            amount: plantAmount,
            siteDiaryId: siteDiaryId,
            createdBy: { name: session.data?.user?.name || "You" },
            createdById: session.data?.user?.id || Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          if (oldSiteDiary) {
            const newSiteDiary = { ...oldSiteDiary };
            newSiteDiary.plants = [
              ...newSiteDiary.plants,
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
    createPlant,
  };
};

export const useUpdatePlant = ({ siteDiaryId }: { siteDiaryId: string }) => {
  const utils = api.useContext();
  const { mutate: updatePlant } = api.plant.updatePlant.useMutation({
    async onMutate({ plantId, plantType, plantAmount }) {
      await utils.siteDiary.getSiteDiary.cancel();
      const previousData = utils.siteDiary.getSiteDiary.getData();
      utils.siteDiary.getSiteDiary.setData(
        { siteDiaryId: siteDiaryId },
        (oldSiteDiary) => {
          if (oldSiteDiary) {
            const newPlants = oldSiteDiary.plants.map((oldPlant) => {
              return { ...oldPlant };
            });
            const plantToUpdateIndex = newPlants?.findIndex(
              (plant) => plant.id === plantId
            );
            const updatedPlant = newPlants[plantToUpdateIndex];
            if (updatedPlant) {
              updatedPlant.type = plantType;
              updatedPlant.amount = plantAmount;
              newPlants[plantToUpdateIndex] = updatedPlant;
            }
            const newSiteDiary = { ...oldSiteDiary };
            newSiteDiary.plants = newPlants;
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
    onSuccess(data, { plantId, plantType, plantAmount }) {
      utils.siteDiary.getSiteDiary.setData(
        { siteDiaryId: siteDiaryId },
        (oldSiteDiary) => {
          if (oldSiteDiary) {
            const newPlants = oldSiteDiary.plants.map((oldPlant) => {
              return { ...oldPlant };
            });
            const plantToUpdateIndex = newPlants?.findIndex(
              (plant) => plant.id === plantId
            );
            const updatedPlant = newPlants[plantToUpdateIndex];
            if (updatedPlant) {
              updatedPlant.type = plantType;
              updatedPlant.amount = plantAmount;
              newPlants[plantToUpdateIndex] = updatedPlant;
            }
            const newSiteDiary = { ...oldSiteDiary };
            newSiteDiary.plants = newPlants;
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
    updatePlant,
  };
};

export const useDeletePlant = ({
  pendingDeleteCountRef,
  siteDiaryId,
}: {
  pendingDeleteCountRef?: MutableRefObject<number>;
  siteDiaryId: string;
}) => {
  const utils = api.useContext();
  const { mutate: deletePlant } = api.plant.deletePlant.useMutation({
    async onMutate({ plantId }) {
      if (pendingDeleteCountRef) pendingDeleteCountRef.current += 1;
      await utils.siteDiary.getSiteDiary.cancel();
      const previousData = utils.siteDiary.getSiteDiary.getData();
      utils.siteDiary.getSiteDiary.setData(
        { siteDiaryId: siteDiaryId },
        (oldSiteDiary) => {
          if (oldSiteDiary) {
            const newPlants = oldSiteDiary?.plants.filter(
              (oldPlant) => oldPlant.id !== plantId
            );
            const newSiteDiary = { ...oldSiteDiary };
            newSiteDiary.plants = newPlants;
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
    onSuccess(data, { plantId }) {
      utils.siteDiary.getSiteDiary.setData(
        { siteDiaryId: siteDiaryId },
        (oldSiteDiary) => {
          if (oldSiteDiary) {
            const newPlants = oldSiteDiary?.plants.filter(
              (oldPlant) => oldPlant.id !== plantId
            );
            const newSiteDiary = { ...oldSiteDiary };
            newSiteDiary.plants = newPlants;
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
    deletePlant,
  };
};
