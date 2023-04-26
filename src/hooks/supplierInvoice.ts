import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
import { api } from "../utils/api";

export type supplierInvoice = {
  id: string;
  costCode: string;
  invoiceNo: string;
  invoiceDate: string;
  description: string;
  vendorName: string;
  supplierName: string;
  totalCost: number;
  createdBy: string | null;
};

export const useCreateSupplierInvoice = () => {
  const utils = api.useContext();
  const session = useSession();
  const { mutate: createSupplierInvoice } = api.supplierInvoice.createSupplierInvoice.useMutation(
    {
      async onMutate(values) {
        await utils.supplierInvoice.getSupplierInvoices.cancel();
        const previousData = utils.supplierInvoice.getSupplierInvoices.getData();
        utils.supplierInvoice.getSupplierInvoices.setData(
          { projectId: values.projectId },
          (oldSupplierInvoices) => {
            const optimisticUpdateObject = {
              id: Date.now().toString(),
              costCode: values.supplierInvoiceCostCode,
              invoiceNo: values.supplierInvoiceNo,
              invoiceDate: values.supplierInvoiceDate,
              description: values.description,
              vendorName: values.vendorName,
              supplierName: values.supplierName,
              totalCost: values.totalCost,
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
    }
  );
  return {
    createSupplierInvoice,
  };
};

export const useGetSupplierInvoices = ({ projectId }: { projectId: string }) => {
  const { data, isLoading } = api.supplierInvoice.getSupplierInvoices.useQuery({
    projectId: projectId,
  });
  return {
    supplierInvoices: data,
    isLoading: isLoading,
  };
};

export const useGetSupplierInvoice = ({ supplierInvoiceId }: { supplierInvoiceId: string }) => {
  const { data, isLoading } = api.supplierInvoice.getSupplierInvoice.useQuery({
    supplierInvoiceId: supplierInvoiceId,
  });
  return {
    supplierInvoice: data,
    isLoading: isLoading,
  };
};

export const useUpdateSupplierInvoice = ({ projectId }: { projectId: string }) => {
  const utils = api.useContext();
  const { mutate: updateSupplierInvoice } = api.supplierInvoice.updateSupplierInvoice.useMutation(
    {
      async onMutate({ supplierInvoiceId, supplierInvoiceNo, supplierInvoiceDate }) {
        await utils.supplierInvoice.getSupplierInvoices.cancel();
        const previousData = utils.supplierInvoice.getSupplierInvoices.getData();
        utils.supplierInvoice.getSupplierInvoices.setData(
          { projectId: projectId },
          (oldSupplierInvoices) => {
            if (oldSupplierInvoices) {
              const newSupplierInvoices = oldSupplierInvoices.map((oldSupplierInvoice) => {
                return { ...oldSupplierInvoice };
              });
              const supplierInvoiceToUpdateIndex = newSupplierInvoices?.findIndex(
                (supplierInvoice) => supplierInvoice.id === supplierInvoiceId
              );
              const updatedSupplierInvoice = newSupplierInvoices[supplierInvoiceToUpdateIndex];
              if (updatedSupplierInvoice) {
                updatedSupplierInvoice.invoiceNo = supplierInvoiceNo;
                updatedSupplierInvoice.invoiceDate = supplierInvoiceDate;
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
      onSuccess(data, { supplierInvoiceId, supplierInvoiceNo, supplierInvoiceDate }) {
        utils.supplierInvoice.getSupplierInvoices.setData(
          { projectId: projectId },
          (oldSupplierInvoices) => {
            if (oldSupplierInvoices) {
              const newSupplierInvoices = oldSupplierInvoices.map((oldSupplierInvoice) => {
                return { ...oldSupplierInvoice };
              });
              const supplierInvoiceToUpdateIndex = newSupplierInvoices?.findIndex(
                (supplierInvoice) => supplierInvoice.id === supplierInvoiceId
              );
              const updatedSupplierInvoice = newSupplierInvoices[supplierInvoiceToUpdateIndex];
              if (updatedSupplierInvoice) {
                updatedSupplierInvoice.invoiceNo = supplierInvoiceNo;
                updatedSupplierInvoice.invoiceDate = supplierInvoiceDate;
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
    }
  );
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

  const { mutate: deleteSupplierInvoice } = api.supplierInvoice.deleteSupplierInvoice.useMutation(
    {
      async onMutate({ supplierInvoiceId }) {
        if (pendingDeleteCountRef) pendingDeleteCountRef.current += 1; // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache
        await utils.supplierInvoice.getSupplierInvoices.cancel();
        const previousData = utils.supplierInvoice.getSupplierInvoices.getData();
        utils.supplierInvoice.getSupplierInvoices.setData(
          { projectId: projectId },
          (oldSupplierInvoices) => {
            const newSupplierInvoices = oldSupplierInvoices?.filter(
              (newSupplierInvoice) => newSupplierInvoice.id !== supplierInvoiceId
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
              (newSupplierInvoice) => newSupplierInvoice.id !== supplierInvoiceId
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
    }
  );
  return {
    deleteSupplierInvoice,
  };
};
