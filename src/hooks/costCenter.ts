import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
import { api } from "../utils/api";

export type CostCenter = {
  projectId: string;
  code?: string,
  name?: string;
  cost?: number;
  budget?: number;
};

export const useCreateCostCenter = () => {
  const utils = api.useContext();
  const session = useSession();
  const { mutate: createCostCenter } = api.costCenter.createCostCenter.useMutation({
    async onMutate(values) {
      await utils.costCenter.getCostCenters.cancel();
      const previousData = utils.costCenter.getCostCenters.getData();
      utils.costCenter.getCostCenters.setData(
        { projectId: values.projectId }, 
        (oldCostCenters) => {
          const optimisticUpdateObject = {
            id: Date.now().toString(),
            code: values.code,
            name: values.name,
            budget: values.budget,
            cost: values.cost,
            projectId: values.projectId,
            createdBy: { name: session.data?.user?.name || "You" },
            createdAt: new Date(Date.now()).toLocaleDateString(),
          };
          if (oldCostCenters != undefined) {
            return [...oldCostCenters, optimisticUpdateObject];
          } else {
            return [optimisticUpdateObject];
          }
      });
      return () => utils.costCenter.getCostCenters.setData(
                  { projectId: values.projectId }, 
                  previousData);
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    async onSettled() {
      await utils.costCenter.getCostCenters.invalidate();
    },
  });
  return {
    createCostCenter,
  };
};

export const useGetCostCenters = ({
  projectId,
}: {
  projectId: string;
}) => {
  const { data, isLoading } = api.costCenter.getCostCenters.useQuery({
    projectId: projectId,
  });
  return {
    costCenters: data,
    isLoading: isLoading,
  };
};

export const useGetCostCenter = ({ costCenterId }: { costCenterId: string }) => {
  const { data, isLoading } = api.costCenter.getCostCenter.useQuery({
    costCenterId: costCenterId,
  });
  return {
    costCenter: data,
    isLoading: isLoading,
  };
};

export const useUpdateCostCenter = ({
  projectId,
}: {
  projectId: string;
}) => {
  const utils = api.useContext();
  const { mutate: updateCostCenter } = api.costCenter.updateCostCenter.useMutation({
    async onMutate(values) {
      await utils.costCenter.getCostCenters.cancel();
      const previousData = utils.costCenter.getCostCenters.getData();
      // OU with data from user input
      utils.costCenter.getCostCenters.setData(
        { projectId: projectId }, 
        (oldCostCenters) => {
          if (oldCostCenters) {
            // we must deep clone the object so that React sees that the REFERENCE to
            // the array (and its nested objects!) has changed so that it would rerender.
            const newCostCenters = oldCostCenters.map((oldCostCenter) => {
              return { ...oldCostCenter };
            });
            const costCenterToUpdateIndex = newCostCenters?.findIndex(
              (costCenter) => costCenter.id === values.costCenterId
            );
            const updatedCostCenter = newCostCenters[costCenterToUpdateIndex];
            if (updatedCostCenter) {
              updatedCostCenter.code = values.code;
              updatedCostCenter.name = values.name;
              updatedCostCenter.cost = values.cost;
              newCostCenters[costCenterToUpdateIndex] = updatedCostCenter;
            }
            return newCostCenters;
          } else {
            return oldCostCenters;
          }
      });
      return () => utils.costCenter.getCostCenters.setData(
        { projectId: projectId }, 
        previousData);
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    // do not do this with list-length non-idempotent mutations (eg. create
    // in a list. "Update" and "delete" are fine because they are idempotent)
    // because it might end up appending twice
    onSuccess(data, values) {
      // OU with data returned from the server
      utils.costCenter.getCostCenters.setData(
          { projectId: projectId }, 
          (oldCostCenters) => {
        if (oldCostCenters) {
          // we must deep clone the object so that React sees that the REFERENCE to
          // the array (and its nested objects!) has changed so that it would rerender.
          const newCostCenters = oldCostCenters.map((oldCostCenter) => {
            return { ...oldCostCenter };
          });
          const costCenterToUpdateIndex = newCostCenters?.findIndex(
            (costCenter) => costCenter.id === values.costCenterId
          );
          const updatedCostCenter = newCostCenters[costCenterToUpdateIndex];
          if (updatedCostCenter) {
            updatedCostCenter.code = values.code;
            updatedCostCenter.name = values.name;
            updatedCostCenter.cost = values.cost;
            newCostCenters[costCenterToUpdateIndex] = updatedCostCenter;
          }
          return newCostCenters;
        } else {
          return oldCostCenters;
        }
      });
    },
    async onSettled() {
      // Actually sync data with server
      await utils.costCenter.getCostCenters.invalidate();
    },
  });
  return {
    updateCostCenter,
  };
};

export const useDeleteCostCenter = ({
  pendingDeleteCountRef,
  projectId
}: {
  pendingDeleteCountRef?: MutableRefObject<number>;
  projectId: string;
}) => {
  const utils = api.useContext();
  const { mutate: deleteCostCenter } = api.costCenter.deleteCostCenter.useMutation({
    async onMutate({ costCenterId }) {
      if (pendingDeleteCountRef) pendingDeleteCountRef.current += 1;
      await utils.costCenter.getCostCenters.cancel();
      const previousData = utils.costCenter.getCostCenters.getData();
      utils.costCenter.getCostCenters.setData(
        { projectId: projectId }, 
        (oldCostCenters) => {
        const newCostCenters = oldCostCenters?.filter(
          (oldCostCenter) => oldCostCenter.id !== costCenterId
        );
        return newCostCenters;
      });
      return () => utils.costCenter.getCostCenters.setData(
        { projectId: projectId }, previousData);
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    onSuccess(data, { costCenterId }) {
      utils.costCenter.getCostCenters.setData(
        { projectId: projectId }, 
        (oldCostCenters) => {
        const newCostCenters = oldCostCenters?.filter(
          (oldCostCenter) => oldCostCenter.id !== costCenterId
        );
        return newCostCenters;
      });
    },
    async onSettled() {
      if (pendingDeleteCountRef) {
        pendingDeleteCountRef.current -= 1;
        if (pendingDeleteCountRef.current === 0) {
          await utils.costCenter.getCostCenters.invalidate();
        }
      } else {
        await utils.costCenter.getCostCenters.invalidate();
      }
    },
  });
  return {
    deleteCostCenter,
  };
};