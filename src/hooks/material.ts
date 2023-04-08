import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
import { api } from "../utils/api";

export const useCreateMaterial = () => {
  const utils = api.useContext();
  const session = useSession();
  const { mutate: createMaterial } = api.material.createMaterial.useMutation({
    async onMutate({
      materialUnits,
      siteDiaryId,
      materialAmount,
      materialType,
    }) {
      await utils.siteDiary.getSiteDiary.cancel();
      const previousData = utils.siteDiary.getSiteDiary.getData();
      utils.siteDiary.getSiteDiary.setData(
        { siteDiaryId: siteDiaryId },
        (oldSiteDiary) => {
          const optimisticUpdateObject = {
            id: Date.now().toString(),
            type: materialType,
            units: materialUnits,
            amount: materialAmount,
            siteDiaryId: siteDiaryId,
            createdBy: { name: session.data?.user?.name || "You" },
            createdById: session.data?.user?.id || Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          if (oldSiteDiary) {
            const newSiteDiary = { ...oldSiteDiary };
            newSiteDiary.materials = [
              ...newSiteDiary.materials,
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
    createMaterial,
  };
};

export const useUpdateMaterial = ({ siteDiaryId }: { siteDiaryId: string }) => {
  const utils = api.useContext();
  const { mutate: updateMaterial } = api.material.updateMaterial.useMutation({
    async onMutate({
      materialId,
      materialUnits,
      materialAmount,
      materialType,
    }) {
      await utils.siteDiary.getSiteDiary.cancel();
      const previousData = utils.siteDiary.getSiteDiary.getData();
      utils.siteDiary.getSiteDiary.setData(
        { siteDiaryId: siteDiaryId },
        (oldSiteDiary) => {
          if (oldSiteDiary) {
            const newMaterials = oldSiteDiary.materials.map((oldMaterial) => {
              return { ...oldMaterial };
            });
            const materialToUpdateIndex = newMaterials?.findIndex(
              (material) => material.id === materialId
            );
            const updatedMaterial = newMaterials[materialToUpdateIndex];
            if (updatedMaterial) {
              updatedMaterial.units = materialUnits;
              updatedMaterial.amount = materialAmount;
              updatedMaterial.type = materialType;
              newMaterials[materialToUpdateIndex] = updatedMaterial;
            }
            const newSiteDiary = { ...oldSiteDiary };
            newSiteDiary.materials = newMaterials;
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
    onSuccess(
      data,
      { materialId, materialUnits, materialAmount, materialType }
    ) {
      utils.siteDiary.getSiteDiary.setData(
        { siteDiaryId: siteDiaryId },
        (oldSiteDiary) => {
          if (oldSiteDiary) {
            const newMaterials = oldSiteDiary.materials.map((oldMaterial) => {
              return { ...oldMaterial };
            });
            const materialToUpdateIndex = newMaterials?.findIndex(
              (material) => material.id === materialId
            );
            const updatedMaterial = newMaterials[materialToUpdateIndex];
            if (updatedMaterial) {
              updatedMaterial.units = materialUnits;
              updatedMaterial.amount = materialAmount;
              updatedMaterial.type = materialType;
              newMaterials[materialToUpdateIndex] = updatedMaterial;
            }
            const newSiteDiary = { ...oldSiteDiary };
            newSiteDiary.materials = newMaterials;
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
    updateMaterial,
  };
};

export const useDeleteMaterial = ({
  pendingDeleteCountRef,
  siteDiaryId,
}: {
  pendingDeleteCountRef?: MutableRefObject<number>;
  siteDiaryId: string;
}) => {
  const utils = api.useContext();
  const { mutate: deleteMaterial } = api.material.deleteMaterial.useMutation({
    async onMutate({ materialId }) {
      if (pendingDeleteCountRef) pendingDeleteCountRef.current += 1;
      await utils.siteDiary.getSiteDiary.cancel();
      const previousData = utils.siteDiary.getSiteDiary.getData();
      utils.siteDiary.getSiteDiary.setData(
        { siteDiaryId: siteDiaryId },
        (oldSiteDiary) => {
          if (oldSiteDiary) {
            const newMaterials = oldSiteDiary?.materials.filter(
              (oldMaterial) => oldMaterial.id !== materialId
            );
            const newSiteDiary = { ...oldSiteDiary };
            newSiteDiary.materials = newMaterials;
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
    onSuccess(data, { materialId }) {
      utils.siteDiary.getSiteDiary.setData(
        { siteDiaryId: siteDiaryId },
        (oldSiteDiary) => {
          if (oldSiteDiary) {
            const newMaterials = oldSiteDiary?.materials.filter(
              (oldMaterial) => oldMaterial.id !== materialId
            );
            const newSiteDiary = { ...oldSiteDiary };
            newSiteDiary.materials = newMaterials;
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
    deleteMaterial,
  };
};
