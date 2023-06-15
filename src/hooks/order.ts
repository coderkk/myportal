import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
import { api } from "../utils/api";

export type order = {
  id: string;
  name: string;
  date: string;
  createdBy: string | null;
};

export const useCreateOrder = () => {
  const utils = api.useContext();
  const session = useSession();
  const { mutate: createOrder } = api.order.createOrder.useMutation({
    async onMutate(values) {
      await utils.order.getOrders.cancel();
      const previousData = utils.order.getOrders.getData();
      utils.order.getOrders.setData(
        { projectId: values.projectId },
        (oldOrders) => {
          const optimisticUpdateObject = {
            id: Date.now().toString(),
            orderNote: values.orderNote,
            orderNumber: values.orderNumber,
            arrivalOnSite: values.orderArrivalOnSite || "NO",
            supplierEmailAddress: values.orderSupplierEmailAddress,
            createdBy: { name: session.data?.user?.name || "You" },
          };
          if (oldOrders) {
            return [...oldOrders, optimisticUpdateObject];
          } else {
            return [optimisticUpdateObject];
          }
        }
      );
      return () =>
        utils.order.getOrders.setData(
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
      await utils.order.getOrders.invalidate();
    },
  });
  return {
    createOrder,
  };
};

export const useGetOrders = ({ projectId }: { projectId: string }) => {
  const { data, isLoading } = api.order.getOrders.useQuery({
    projectId: projectId,
  });
  return {
    orders: data,
    isLoading: isLoading,
  };
};

export const useUpdateOrder = ({ projectId }: { projectId: string }) => {
  const utils = api.useContext();
  const { mutate: updateOrder } = api.order.updateOrder.useMutation({
    async onMutate({
      orderId,
      orderNote,
      orderNumber,
      orderArrivalOnSite,
      orderSupplierEmailAddress,
    }) {
      await utils.order.getOrders.cancel();
      const previousData = utils.order.getOrders.getData();
      utils.order.getOrders.setData({ projectId: projectId }, (oldOrders) => {
        if (oldOrders) {
          const newOrders = oldOrders.map((oldOrder) => {
            return { ...oldOrder };
          });
          const orderToUpdateIndex = newOrders?.findIndex(
            (order) => order.id === orderId
          );
          const updatedOrder = newOrders[orderToUpdateIndex];
          if (updatedOrder) {
            updatedOrder.orderNote = orderNote;
            updatedOrder.orderNumber = orderNumber;
            updatedOrder.arrivalOnSite = orderArrivalOnSite || "NO";
            updatedOrder.supplierEmailAddress = orderSupplierEmailAddress;
            newOrders[orderToUpdateIndex] = updatedOrder;
          }
          return newOrders;
        } else {
          return oldOrders;
        }
      });
      return () =>
        utils.order.getOrders.setData({ projectId: projectId }, previousData);
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    onSuccess(
      data,
      {
        orderId,
        orderNumber,
        orderNote,
        orderArrivalOnSite,
        orderSupplierEmailAddress,
      }
    ) {
      utils.order.getOrders.setData({ projectId: projectId }, (oldOrders) => {
        if (oldOrders) {
          const newOrders = oldOrders.map((oldOrder) => {
            return { ...oldOrder };
          });
          const orderToUpdateIndex = newOrders?.findIndex(
            (order) => order.id === orderId
          );
          const updatedOrder = newOrders[orderToUpdateIndex];
          if (updatedOrder) {
            updatedOrder.orderNote = orderNote;
            updatedOrder.orderNumber = orderNumber;
            updatedOrder.arrivalOnSite = orderArrivalOnSite || "NO";
            updatedOrder.supplierEmailAddress = orderSupplierEmailAddress;
            newOrders[orderToUpdateIndex] = updatedOrder;
          }
          return newOrders;
        } else {
          return oldOrders;
        }
      });
    },
    async onSettled() {
      await utils.order.getOrders.invalidate();
    },
  });
  return {
    updateOrder,
  };
};

export const useDeleteOrder = ({
  pendingDeleteCountRef,
  projectId,
}: {
  pendingDeleteCountRef?: MutableRefObject<number>;
  projectId: string;
}) => {
  const utils = api.useContext();

  const { mutate: deleteOrder } = api.order.deleteOrder.useMutation({
    async onMutate({ orderId }) {
      if (pendingDeleteCountRef) pendingDeleteCountRef.current += 1; // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache
      await utils.order.getOrders.cancel();
      const previousData = utils.order.getOrders.getData();
      utils.order.getOrders.setData({ projectId: projectId }, (oldOrders) => {
        const newOrders = oldOrders?.filter(
          (newOrder) => newOrder.id !== orderId
        );
        return newOrders;
      });
      return () =>
        utils.order.getOrders.setData({ projectId: projectId }, previousData);
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    onSuccess(data, { orderId }) {
      utils.order.getOrders.setData({ projectId: projectId }, (oldOrders) => {
        const newOrders = oldOrders?.filter(
          (newOrder) => newOrder.id !== orderId
        );
        return newOrders;
      });
    },
    async onSettled() {
      if (pendingDeleteCountRef) {
        pendingDeleteCountRef.current -= 1;
        if (pendingDeleteCountRef.current === 0) {
          await utils.order.getOrders.invalidate();
        }
      } else {
        await utils.order.getOrders.invalidate();
      }
    },
  });
  return {
    deleteOrder,
  };
};
