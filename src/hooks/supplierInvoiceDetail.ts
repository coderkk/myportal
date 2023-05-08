import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
import { api } from "../utils/api";

export type supplierInvoiceDetail = {
  id: string;
  supplierInvoiceDetailId: string;
  supplierInvoiceId: string;
  description: string;
  uom: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  amount: number;
  createdBy: string | null;
};

export const useCreateSupplierInvoiceDetail = () => {
  const utils = api.useContext();
  const session = useSession();
  const { mutate: createSupplierInvoiceDetail } =
    api.supplierInvoiceDetail.createSupplierInvoiceDetail.useMutation({
      async onMutate(values) {
        await utils.supplierInvoiceDetail.getSupplierInvoiceDetails.cancel();
        const previousData =
          utils.supplierInvoiceDetail.getSupplierInvoiceDetails.getData();
        utils.supplierInvoiceDetail.getSupplierInvoiceDetails.setData(
          { supplierInvoiceId: values.supplierInvoiceId },
          (oldSupplierInvoiceDetails) => {
            const optimisticUpdateObject = {
              id: Date.now().toString(),
              supplierInvoiceId: values.supplierInvoiceId,
              description: values.description,
              uom: values.uom,
              quantity: values.quantity,
              unitPrice: values.unitPrice,
              discount: values.discount,
              amount: values.amount,
              createdBy: { name: session.data?.user?.name || "You" },
            };
            if (oldSupplierInvoiceDetails) {
              return [...oldSupplierInvoiceDetails, optimisticUpdateObject];
            } else {
              return [optimisticUpdateObject];
            }
          }
        );
        return () =>
          utils.supplierInvoiceDetail.getSupplierInvoiceDetails.setData(
            { supplierInvoiceId: values.supplierInvoiceId },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      async onSettled() {
        await utils.supplierInvoiceDetail.getSupplierInvoiceDetails.invalidate();
      },
    });
  return {
    createSupplierInvoiceDetail,
  };
};

export const useGetSupplierInvoiceDetails = ({
  supplierInvoiceId,
}: {
  supplierInvoiceId: string;
}) => {
  const { data, isLoading } = api.supplierInvoiceDetail.getSupplierInvoiceDetails.useQuery({
    supplierInvoiceId: supplierInvoiceId,
  });
  return {
    supplierInvoiceDetails: data,
    isLoading: isLoading,
  };
};

export const useGetSupplierInvoiceDetail = ({ 
  supplierInvoiceDetailId, 
}: { 
  supplierInvoiceDetailId: string 
}) => {
  const { data, isLoading } = api.supplierInvoiceDetail.getSupplierInvoiceDetail.useQuery({
    supplierInvoiceDetailId: supplierInvoiceDetailId,
  });
  return {
    supplierInvoiceDetail: data,
    isLoading: isLoading,
  };
};

export const useUpdateSupplierInvoiceDetail = ({
  supplierInvoiceId,
}: {
  supplierInvoiceId: string;
}) => {
  const utils = api.useContext();
  const { mutate: updateSupplierInvoiceDetail } = api.supplierInvoiceDetail.updateSupplierInvoiceDetail.useMutation(
    {
      async onMutate(values) {
        await utils.supplierInvoiceDetail.getSupplierInvoiceDetails.cancel();
        const previousData =
          utils.supplierInvoiceDetail.getSupplierInvoiceDetails.getData();
        utils.supplierInvoiceDetail.getSupplierInvoiceDetails.setData(
          { supplierInvoiceId: supplierInvoiceId },
          (oldSupplierInvoiceDetails) => {
            if (oldSupplierInvoiceDetails) {
              const newSupplierInvoiceDetails = oldSupplierInvoiceDetails.map((oldSupplierInvoiceDetail) => {
                return { ...oldSupplierInvoiceDetail };
              });
              const supplierInvoiceDetailToUpdateIndex =
                newSupplierInvoiceDetails?.findIndex(
                  (supplierInvoiceDetail) => supplierInvoiceDetail.id === values.supplierInvoiceDetailId
                );
              const updatedSupplierInvoiceDetail =
                newSupplierInvoiceDetails[supplierInvoiceDetailToUpdateIndex];
              if (updatedSupplierInvoiceDetail) {
                updatedSupplierInvoiceDetail.supplierInvoiceId = values.supplierInvoiceId;
                updatedSupplierInvoiceDetail.description = values.description;
                updatedSupplierInvoiceDetail.uom = values.uom;
                updatedSupplierInvoiceDetail.quantity = values.quantity;
                updatedSupplierInvoiceDetail.unitPrice = values.unitPrice;
                updatedSupplierInvoiceDetail.discount = values.discount;
                updatedSupplierInvoiceDetail.amount = values.amount;
                newSupplierInvoiceDetails[supplierInvoiceDetailToUpdateIndex] = updatedSupplierInvoiceDetail;
              }
              return newSupplierInvoiceDetails;
            } else {
              return oldSupplierInvoiceDetails;
            }
          }
        );
        return () =>
          utils.supplierInvoiceDetail.getSupplierInvoiceDetails.setData(
            { supplierInvoiceId: supplierInvoiceId },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      onSuccess(data, { supplierInvoiceDetailId, 
                        supplierInvoiceId, description,
                        uom, quantity, unitPrice, discount, amount }) {
        utils.supplierInvoiceDetail.getSupplierInvoiceDetails.setData(
          { supplierInvoiceId: supplierInvoiceId },
          (oldSupplierInvoiceDetails) => {
            if (oldSupplierInvoiceDetails) {
              const newSupplierInvoiceDetails = oldSupplierInvoiceDetails.map((oldSupplierInvoiceDetail) => {
                return { ...oldSupplierInvoiceDetail };
              });
              const supplierInvoiceDetailToUpdateIndex = 
                newSupplierInvoiceDetails?.findIndex(
                  (supplierInvoiceDetail) => supplierInvoiceDetail.id === supplierInvoiceDetailId
                );
              const updatedSupplierInvoiceDetail =
                newSupplierInvoiceDetails[supplierInvoiceDetailToUpdateIndex];
              if (updatedSupplierInvoiceDetail) {
                updatedSupplierInvoiceDetail.supplierInvoiceId = supplierInvoiceId;
                updatedSupplierInvoiceDetail.description = description;
                updatedSupplierInvoiceDetail.uom = uom;
                updatedSupplierInvoiceDetail.quantity = quantity;
                updatedSupplierInvoiceDetail.unitPrice = unitPrice;
                updatedSupplierInvoiceDetail.discount = discount;
                updatedSupplierInvoiceDetail.amount = amount;
                newSupplierInvoiceDetails[supplierInvoiceDetailToUpdateIndex] = updatedSupplierInvoiceDetail;
              }
              return newSupplierInvoiceDetails;
            } else {
              return oldSupplierInvoiceDetails;
            }
          }
        );
      },
      async onSettled() {
        await utils.supplierInvoiceDetail.getSupplierInvoiceDetails.invalidate();
      },
    });
  return {
    updateSupplierInvoiceDetail,
  };
};

export const useDeleteSupplierInvoiceDetail = ({
  pendingDeleteCountRef,
  supplierInvoiceId,
}: {
  pendingDeleteCountRef?: MutableRefObject<number>;
  supplierInvoiceId: string;
}) => {
  const utils = api.useContext();

  const { mutate: deleteSupplierInvoiceDetail } =
    api.supplierInvoiceDetail.deleteSupplierInvoiceDetail.useMutation({
      async onMutate({ supplierInvoiceDetailId }) {
        if (pendingDeleteCountRef) pendingDeleteCountRef.current += 1; // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache
        await utils.supplierInvoiceDetail.getSupplierInvoiceDetails.cancel();
        const previousData =
          utils.supplierInvoiceDetail.getSupplierInvoiceDetails.getData();
        utils.supplierInvoiceDetail.getSupplierInvoiceDetails.setData(
          { supplierInvoiceId: supplierInvoiceId },
          (oldSupplierInvoiceDetails) => {
            const newSupplierInvoiceDetails = oldSupplierInvoiceDetails?.filter(
              (newSupplierInvoiceDetail) =>
                newSupplierInvoiceDetail.id !== supplierInvoiceDetailId
            );
            return newSupplierInvoiceDetails;
          }
        );
        return () =>
          utils.supplierInvoiceDetail.getSupplierInvoiceDetails.setData(
            { supplierInvoiceId: supplierInvoiceId },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      onSuccess(data, { supplierInvoiceDetailId }) {
        utils.supplierInvoiceDetail.getSupplierInvoiceDetails.setData(
          { supplierInvoiceId: supplierInvoiceId },
          (oldSupplierInvoiceDetails) => {
            const newSupplierInvoiceDetails = oldSupplierInvoiceDetails?.filter(
              (newSupplierInvoiceDetail) =>
                newSupplierInvoiceDetail.id !== supplierInvoiceDetailId
            );
            return newSupplierInvoiceDetails;
          }
        );
      },
      async onSettled() {
        if (pendingDeleteCountRef) {
          pendingDeleteCountRef.current -= 1;
          if (pendingDeleteCountRef.current === 0) {
            await utils.supplierInvoiceDetail.getSupplierInvoiceDetails.invalidate();
          }
        } else {
          await utils.supplierInvoiceDetail.getSupplierInvoiceDetails.invalidate();
        }
      },
    });
  return {
    deleteSupplierInvoiceDetail,
  };
};
