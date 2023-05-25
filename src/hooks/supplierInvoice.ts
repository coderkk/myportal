import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
import { api } from "../utils/api";

export type supplierInvoice = {
  supplierInvoiceId?: string,
  projectId?: string;
  invoiceNo?: string;
  invoiceDate?: Date | null;
  budgetId?: string | null;
  vendorName?: string;
  vendorAddress?: string;
  vendorPhone?: string;
  supplierName?: string;
  supplierId?: string;
  supplierAddress?: string;
  supplierPhone?: string;
  paymentDueDate?: Date | null;
  salePerson?: string;
  paymentTerm?: string;
  deliveryDate?: Date | null;
  shipmentMethod?: string;
  shipmentTerm?: string;
  description?: string;
  totalDiscount?: number;
  grandAmount?: number;
  taxAmount?: number;
  netAmount?: number;
  fileId?: string;
};

export const useCreateSupplierInvoice = () => {
  const utils = api.useContext();
  const session = useSession();
  const { mutateAsync: createSupplierInvoice } =
    api.supplierInvoice.createSupplierInvoice.useMutation({
      async onMutate(values) {
        await utils.supplierInvoice.getSupplierInvoices.cancel();
        const previousData =
          utils.supplierInvoice.getSupplierInvoices.getData();
        utils.supplierInvoice.getSupplierInvoices.setData(
          { projectId: values.projectId },
          (oldSupplierInvoices) => {
            const optimisticUpdateObject = {
              id: Date.now().toString(),
              budgetId: values.budgetId,
              invoiceNo: values.invoiceNo,
              invoiceDate: values.invoiceDate,
              description: values.description,
              vendorName: values.vendorName,
              vendorAddress: values.vendorAddress,
              vendorPhone: values.vendorPhone,
              supplierName: values.supplierName,
              supplierAddress: values.supplierAddress,
              supplierPhone: values.supplierPhone,
              grandAmount: values.grandAmount,
              taxAmount: values.taxAmount,
              netAmount: values.netAmount,
              projectId: values.projectId,
              createdBy: { name: session.data?.user?.name || "You" },
            };
            if (oldSupplierInvoices) {
              return [...oldSupplierInvoices, optimisticUpdateObject];
            } else {
              return [optimisticUpdateObject];
            }
          }
        );
        return () =>
          utils.supplierInvoice.getSupplierInvoices.setData(
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
        await utils.supplierInvoice.getSupplierInvoices.invalidate();
      },
    });
  return {
    createSupplierInvoice,
  };
};

export const useGetSupplierInvoices = ({
  projectId,
}: {
  projectId: string;
}) => {
  const { data, isLoading } = api.supplierInvoice.getSupplierInvoices.useQuery({
    projectId: projectId,
  });
  return {
    supplierInvoices: data,
    isLoading: isLoading,
  };
};

export const useGetSupplierInvoice = ({ 
  supplierInvoiceId, 
}: { 
  supplierInvoiceId: string 
}) => {
  const { data, isLoading } = api.supplierInvoice.getSupplierInvoice.useQuery({
    supplierInvoiceId: supplierInvoiceId,
  });
  return {
    supplierInvoice: data,
    isLoading: isLoading,
  };
};

export const useUpdateSupplierInvoice = ({
  projectId,
}: {
  projectId: string;
}) => {
  const utils = api.useContext();
  const { mutate: updateSupplierInvoice } = api.supplierInvoice.updateSupplierInvoice.useMutation(
    {
      async onMutate(values) {
        await utils.supplierInvoice.getSupplierInvoices.cancel();
        const previousData =
          utils.supplierInvoice.getSupplierInvoices.getData();
        utils.supplierInvoice.getSupplierInvoices.setData(
          { projectId: projectId },
          (oldSupplierInvoices) => {
            if (oldSupplierInvoices) {
              const newSupplierInvoices = oldSupplierInvoices.map((oldSupplierInvoice) => {
                return { ...oldSupplierInvoice };
              });
              const supplierInvoiceToUpdateIndex =
                newSupplierInvoices?.findIndex(
                  (supplierInvoice) => supplierInvoice.id === values.supplierInvoiceId
                );
              const updatedSupplierInvoice =
                newSupplierInvoices[supplierInvoiceToUpdateIndex];
              if (updatedSupplierInvoice) {
                updatedSupplierInvoice.invoiceNo = values.invoiceNo;
                updatedSupplierInvoice.invoiceDate = values.invoiceDate;
                updatedSupplierInvoice.vendorName = values.vendorName;
                updatedSupplierInvoice.vendorAddress = values.vendorAddress;
                updatedSupplierInvoice.vendorPhone = values.vendorPhone;
                updatedSupplierInvoice.supplierName = values.supplierName;
                updatedSupplierInvoice.supplierAddress = values.supplierAddress;
                updatedSupplierInvoice.supplierPhone = values.supplierPhone;
                updatedSupplierInvoice.grandAmount = values.grandAmount;
                updatedSupplierInvoice.taxAmount = values.taxAmount;
                updatedSupplierInvoice.netAmount = values.netAmount;
                newSupplierInvoices[supplierInvoiceToUpdateIndex] = updatedSupplierInvoice;
              }
              return newSupplierInvoices;
            } else {
              return oldSupplierInvoices;
            }
          }
        );
        return () =>
          utils.supplierInvoice.getSupplierInvoices.setData(
            { projectId: projectId },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      onSuccess(data, { supplierInvoiceId, invoiceNo, invoiceDate }) {
        utils.supplierInvoice.getSupplierInvoices.setData(
          { projectId: projectId },
          (oldSupplierInvoices) => {
            if (oldSupplierInvoices) {
              const newSupplierInvoices = oldSupplierInvoices.map((oldSupplierInvoice) => {
                return { ...oldSupplierInvoice };
              });
              const supplierInvoiceToUpdateIndex = 
                newSupplierInvoices?.findIndex(
                  (supplierInvoice) => supplierInvoice.id === supplierInvoiceId
                );
              const updatedSupplierInvoice =
                newSupplierInvoices[supplierInvoiceToUpdateIndex];
              if (updatedSupplierInvoice) {
                updatedSupplierInvoice.invoiceNo = invoiceNo;
                updatedSupplierInvoice.invoiceDate = invoiceDate;
                newSupplierInvoices[supplierInvoiceToUpdateIndex] = updatedSupplierInvoice;
              }
              return newSupplierInvoices;
            } else {
              return oldSupplierInvoices;
            }
          }
        );
      },
      async onSettled() {
        await utils.supplierInvoice.getSupplierInvoices.invalidate();
      },
    });
  return {
    updateSupplierInvoice,
  };
};

export const useDeleteSupplierInvoice = ({
  pendingDeleteCountRef,
  projectId,
}: {
  pendingDeleteCountRef?: MutableRefObject<number>;
  projectId: string;
}) => {
  const utils = api.useContext();

  const { mutate: deleteSupplierInvoice } =
    api.supplierInvoice.deleteSupplierInvoice.useMutation({
      async onMutate({ supplierInvoiceId }) {
        if (pendingDeleteCountRef) pendingDeleteCountRef.current += 1; // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache
        await utils.supplierInvoice.getSupplierInvoices.cancel();
        const previousData =
          utils.supplierInvoice.getSupplierInvoices.getData();
        utils.supplierInvoice.getSupplierInvoices.setData(
          { projectId: projectId },
          (oldSupplierInvoices) => {
            const newSupplierInvoices = oldSupplierInvoices?.filter(
              (newSupplierInvoice) =>
                newSupplierInvoice.id !== supplierInvoiceId
            );
            return newSupplierInvoices;
          }
        );
        return () =>
          utils.supplierInvoice.getSupplierInvoices.setData(
            { projectId: projectId },
            previousData
          );
      },
      onError(error, values, rollback) {
        if (rollback) {
          rollback();
        }
      },
      onSuccess(data, { supplierInvoiceId }) {
        utils.supplierInvoice.getSupplierInvoices.setData(
          { projectId: projectId },
          (oldSupplierInvoices) => {
            const newSupplierInvoices = oldSupplierInvoices?.filter(
              (newSupplierInvoice) =>
                newSupplierInvoice.id !== supplierInvoiceId
            );
            return newSupplierInvoices;
          }
        );
      },
      async onSettled() {
        if (pendingDeleteCountRef) {
          pendingDeleteCountRef.current -= 1;
          if (pendingDeleteCountRef.current === 0) {
            await utils.supplierInvoice.getSupplierInvoices.invalidate();
          }
        } else {
          await utils.supplierInvoice.getSupplierInvoices.invalidate();
        }
      },
    });
  return {
    deleteSupplierInvoice,
  };
};
