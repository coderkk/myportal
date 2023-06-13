import type { SupplierInvoiceItem } from "@prisma/client";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { nanoid } from "nanoid";
import { useSession } from "next-auth/react";
import type { MutableRefObject } from "react";
import { useMemo } from "react";
import { mutationCountAtom } from "../atoms/supplierInvoiceAtoms";
import { api } from "../utils/api";

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
              supplierName: values.supplierName,
              subtotal: values.subtotal,
              taxes: values.taxes,
              discount: values.discount,
              grandTotal: values.grandTotal,
              fileId: values.fileId,
              paid: values.paid,
              approved: values.approved,
              budgetId: values.budgetId,
              budget: {description: "", costCode: ""},
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
  onSucess: (supplierInvoiceItems: SupplierInvoiceItem[]) => void;
}) => {
  const { data, isLoading, isFetching } =
    api.supplierInvoice.getSupplierInvoice.useQuery(
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
    isFetching: isFetching,
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
                updatedSupplierInvoice.supplierName = values.supplierName;
                updatedSupplierInvoice.subtotal = values.subtotal;
                updatedSupplierInvoice.taxes = values.taxes;
                updatedSupplierInvoice.discount = values.discount;
                updatedSupplierInvoice.grandTotal = values.grandTotal;
                updatedSupplierInvoice.fileId = values.fileId;
                updatedSupplierInvoice.paid = values.paid;
                updatedSupplierInvoice.approved = values.approved;
                updatedSupplierInvoice.budgetId = values.budgetId;
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
        utils.supplierInvoice.getSupplierInvoice.setData(
          { supplierInvoiceId: values.id },
          (oldSupplierInvoice) => {
            if (oldSupplierInvoice) {
              const newSupplierInvoice = { ...oldSupplierInvoice };
              newSupplierInvoice.invoiceNo = values.invoiceNo;
              newSupplierInvoice.invoiceDate = values.invoiceDate;
              newSupplierInvoice.supplierName = values.supplierName;
              newSupplierInvoice.subtotal = values.subtotal;
              newSupplierInvoice.taxes = values.taxes;
              newSupplierInvoice.discount = values.discount;
              newSupplierInvoice.grandTotal = values.grandTotal;
              newSupplierInvoice.fileId = values.fileId;
              newSupplierInvoice.paid = values.paid;
              newSupplierInvoice.approved = values.approved;
              newSupplierInvoice.budgetId = values.budgetId;
              newSupplierInvoice.updatedAt = new Date();
              return newSupplierInvoice;
            } else {
              return oldSupplierInvoice;
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
                updatedSupplierInvoice.supplierName = values.supplierName;
                updatedSupplierInvoice.subtotal = values.subtotal;
                updatedSupplierInvoice.taxes = values.taxes;
                updatedSupplierInvoice.discount = values.discount;
                updatedSupplierInvoice.grandTotal = values.grandTotal;
                updatedSupplierInvoice.fileId = values.fileId;
                updatedSupplierInvoice.paid = values.paid;
                updatedSupplierInvoice.approved = values.approved;
                updatedSupplierInvoice.budgetId = values.budgetId;
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

export const useGetSupplierInvoicesForCSVDownload = () => {
  const {
    data,
    isLoading,
    mutateAsync: getSupplierInvoicesForCSVDownload,
  } = api.supplierInvoice.getSupplierInvoicesForCSVDownload.useMutation();

  return {
    data: useMemo(() => {
      if (!data) return undefined;
      const transformedData: string[][] = [];
      for (const supplierInvoice of data) {
        const {
          invoiceNo,
          invoiceDate,
          budget,
          supplierName,
          taxes,
          discount,
          grandTotal,
        } = supplierInvoice;
        const costCode = `${budget.costCode} (${budget.description})`;
        const invoiceInfo = [
          invoiceNo,
          format(invoiceDate, "dd/MM/yyyy"),
          costCode,
          supplierName,
          taxes.toString(),
          discount.toString(),
          grandTotal.toString(),
        ];
        let firstRow = true;
        if (supplierInvoice.supplierInvoiceItems.length <= 0) {
          transformedData.push(invoiceInfo.concat(["", "", "", "", ""]));
        }
        for (const supplierInvoiceItem of supplierInvoice.supplierInvoiceItems) {
          const { description, quantity, unit, unitPrice, totalPrice } =
            supplierInvoiceItem;
          if (firstRow) {
            transformedData.push(
              invoiceInfo.concat([
                description,
                quantity.toString(),
                unit.toString(),
                unitPrice.toString(),
                totalPrice.toString(),
              ])
            );
            firstRow = false;
          } else {
            const paddingArray: string[] = ["", "", "", "", "", "", ""];
            transformedData.push(
              paddingArray.concat([
                description,
                quantity.toString(),
                unit.toString(),
                unitPrice.toString(),
                totalPrice.toString(),
              ])
            );
          }
        }
      }
      return transformedData;
    }, [data]),
    getSupplierInvoicesForCSVDownload: getSupplierInvoicesForCSVDownload,
    isCSVDataLoading: isLoading,
  };
};
