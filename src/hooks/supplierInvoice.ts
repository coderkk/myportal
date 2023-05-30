import { useAtom } from "jotai";
import { nanoid } from "nanoid";
import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
import { mutationCountAtom } from "../atoms/supplierInvoiceAtoms";
import { api } from "../utils/api";

export type supplierInvoice = {
  id: string;
  description: string;
  invoiceNo: string;
  invoiceDate: Date;
  vendorName: string;
  vendorAddress: string;
  vendorPhone: string;
  supplierName: string;
  supplierAddress: string;
  supplierPhone: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  fileId: string;
  budgetId: string;
};

export type supplierInvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  discount: number;
  amount: number;
};

export const useCreateSupplierInvoice = () => {
  const utils = api.useContext();
  const session = useSession();
  const [, setMutationCount] = useAtom(mutationCountAtom);
  const { mutate: createSupplierInvoice } =
    api.supplierInvoice.createSupplierInvoice.useMutation({
      async onMutate(values) {
        setMutationCount((prev) => prev + 1);
        await utils.supplierInvoice.getSupplierInvoices.cancel();
        const previousData = utils.supplierInvoice.getSupplierInvoices.getData({
          projectId: values.projectId,
        });
        utils.supplierInvoice.getSupplierInvoices.setData(
          { projectId: values.projectId },
          (oldSupplierInvoices) => {
            const optimisticUpdateObject = {
              id: nanoid(),
              invoiceNo: values.invoiceNo,
              invoiceDate: values.invoiceDate,
              description: values.description,
              vendorName: values.vendorName,
              vendorAddress: values.vendorAddress,
              vendorPhone: values.vendorPhone,
              supplierName: values.supplierName,
              supplierAddress: values.supplierAddress,
              supplierPhone: values.supplierPhone,
              amount: values.amount,
              taxAmount: values.taxAmount,
              totalAmount: values.totalAmount,
              fileId: "",
              paid: false, // OU FIX
              approved: false, // OU FIX
              budgetId: values.budgetId,
              projectId: values.projectId,
              createdBy: { name: session.data?.user?.name || "You" },
              createdById: session.data?.user?.id || nanoid(),
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            if (oldSupplierInvoices) {
              return [optimisticUpdateObject, ...oldSupplierInvoices];
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
        setMutationCount((prev) => prev - 1);
        await utils.supplierInvoice.getSupplierInvoices.invalidate();
      },
    });
  return {
    createSupplierInvoice,
  };
};

export const useGetSupplierInvoices = ({
  projectId,
  approved,
  budgetId,
  startDate,
  endDate,
}: {
  projectId: string;
  approved?: boolean;
  budgetId?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  const [mutationCount] = useAtom(mutationCountAtom);
  const { data, isLoading } = api.supplierInvoice.getSupplierInvoices.useQuery(
    {
      projectId: projectId,
      approved: approved,
      budgetId: budgetId,
      startDate: startDate,
      endDate: endDate,
    },
    { enabled: mutationCount === 0, keepPreviousData: true }
  );
  return {
    supplierInvoices: data,
    isLoading: isLoading,
  };
};

export const useGetSupplierInvoice = ({
  supplierInvoiceId,
  onSucess,
}: {
  supplierInvoiceId: string;
  onSucess: (supplierInvoiceItems: supplierInvoiceItem[]) => void;
}) => {
  const { data, isLoading } = api.supplierInvoice.getSupplierInvoice.useQuery(
    {
      supplierInvoiceId: supplierInvoiceId,
    },
    {
      onSuccess: (data) => onSucess(data.supplierInvoiceItems),
    }
  );
  return {
    supplierInvoiceData: data,
    isLoading: isLoading,
  };
};

export const useUpdateSupplierInvoice = ({
  projectId,
}: {
  projectId: string;
}) => {
  const utils = api.useContext();
  const [, setMutationCount] = useAtom(mutationCountAtom);
  const { mutate: updateSupplierInvoice } =
    api.supplierInvoice.updateSupplierInvoice.useMutation({
      async onMutate(values) {
        setMutationCount((prev) => prev + 1);
        await utils.supplierInvoice.getSupplierInvoices.cancel();
        const previousData = utils.supplierInvoice.getSupplierInvoices.getData({
          projectId: values.projectId,
        });
        utils.supplierInvoice.getSupplierInvoices.setData(
          { projectId: projectId },
          (oldSupplierInvoices) => {
            if (oldSupplierInvoices) {
              const newSupplierInvoices = oldSupplierInvoices.map(
                (oldSupplierInvoice) => {
                  return { ...oldSupplierInvoice };
                }
              );
              const supplierInvoiceToUpdateIndex =
                newSupplierInvoices.findIndex(
                  (supplierInvoice) => supplierInvoice.id === values.id
                );
              const updatedSupplierInvoice =
                newSupplierInvoices[supplierInvoiceToUpdateIndex];
              if (updatedSupplierInvoice) {
                updatedSupplierInvoice.invoiceNo = values.invoiceNo;
                updatedSupplierInvoice.invoiceDate = values.invoiceDate;
                updatedSupplierInvoice.description = values.description;
                updatedSupplierInvoice.vendorName = values.vendorName;
                updatedSupplierInvoice.vendorAddress = values.vendorAddress;
                updatedSupplierInvoice.supplierName = values.supplierName;
                updatedSupplierInvoice.supplierAddress = values.supplierAddress;
                updatedSupplierInvoice.vendorPhone = values.vendorPhone;
                updatedSupplierInvoice.supplierPhone = values.supplierPhone;
                updatedSupplierInvoice.amount = values.amount;
                updatedSupplierInvoice.taxAmount = values.taxAmount;
                updatedSupplierInvoice.totalAmount = values.totalAmount;
                updatedSupplierInvoice.budgetId = values.budgetId;
                updatedSupplierInvoice.fileId = values.fileId;
                updatedSupplierInvoice.updatedAt = new Date();
                updatedSupplierInvoice.paid = false; // OU FIX
                updatedSupplierInvoice.approved = false; // OU FIX
                newSupplierInvoices[supplierInvoiceToUpdateIndex] =
                  updatedSupplierInvoice;
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
      onSuccess(data, values) {
        utils.supplierInvoice.getSupplierInvoices.setData(
          { projectId: projectId },
          (oldSupplierInvoices) => {
            if (oldSupplierInvoices) {
              const newSupplierInvoices = oldSupplierInvoices.map(
                (oldSupplierInvoice) => {
                  return { ...oldSupplierInvoice };
                }
              );
              const supplierInvoiceToUpdateIndex =
                newSupplierInvoices?.findIndex(
                  (supplierInvoice) => supplierInvoice.id === values.id
                );
              const updatedSupplierInvoice =
                newSupplierInvoices[supplierInvoiceToUpdateIndex];
              if (updatedSupplierInvoice) {
                updatedSupplierInvoice.invoiceNo = values.invoiceNo;
                updatedSupplierInvoice.invoiceDate = values.invoiceDate;
                updatedSupplierInvoice.description = values.description;
                updatedSupplierInvoice.vendorName = values.vendorName;
                updatedSupplierInvoice.vendorAddress = values.vendorAddress;
                updatedSupplierInvoice.supplierName = values.supplierName;
                updatedSupplierInvoice.supplierAddress = values.supplierAddress;
                updatedSupplierInvoice.vendorPhone = values.vendorPhone;
                updatedSupplierInvoice.supplierPhone = values.supplierPhone;
                updatedSupplierInvoice.amount = values.amount;
                updatedSupplierInvoice.taxAmount = values.taxAmount;
                updatedSupplierInvoice.totalAmount = values.totalAmount;
                updatedSupplierInvoice.budgetId = values.budgetId;
                updatedSupplierInvoice.fileId = values.fileId;
                updatedSupplierInvoice.paid = false; // OU FIX
                updatedSupplierInvoice.approved = false; // OU FIX
                updatedSupplierInvoice.updatedAt = new Date();
                newSupplierInvoices[supplierInvoiceToUpdateIndex] =
                  updatedSupplierInvoice;
              }
              return newSupplierInvoices;
            } else {
              return oldSupplierInvoices;
            }
          }
        );
      },
      async onSettled() {
        setMutationCount((prev) => prev - 1);
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
  const [, setMutationCount] = useAtom(mutationCountAtom);
  const { mutate: deleteSupplierInvoice } =
    api.supplierInvoice.deleteSupplierInvoice.useMutation({
      async onMutate({ supplierInvoiceId }) {
        setMutationCount((prev) => prev + 1);
        if (pendingDeleteCountRef) pendingDeleteCountRef.current += 1; // prevent parallel GET requests as much as possible. # https://profy.dev/article/react-query-usemutation#edge-case-concurrent-updates-to-the-cache
        await utils.supplierInvoice.getSupplierInvoices.cancel();
        const previousData = utils.supplierInvoice.getSupplierInvoices.getData({
          projectId: projectId,
        });
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
        setMutationCount((prev) => prev - 1);
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
