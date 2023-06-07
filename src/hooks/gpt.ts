import { isValid, parse } from "date-fns";
import { nanoid } from "nanoid";
import { useMemo } from "react";
import type { SupplierInvoiceWithItems } from "../pages/projects/[projectId]/invoice/add";
import { api } from "../utils/api";

export const useExtractInvoiceInfo = () => {
  const {
    data,
    isLoading,
    mutate: extractInvoiceInfo,
  } = api.gpt.extractInvoiceInfo.useMutation();

  return {
    // we need useMemo here. Read "2. In the render function"
    // https://tkdodo.eu/blog/react-query-data-transformations
    // the reason is b/c we're doing a setSupplierInvoiceItems
    // in useEffect which causes a re-render
    data: useMemo(
      () =>
        data
          ? ({
              ...data,
              id: "",
              fileId: "",
              budgetId: "",
              invoiceDate: isValid(
                parse(data.invoiceDate, "dd/MM/yyyy", new Date())
              )
                ? parse(data.invoiceDate, "dd/MM/yyyy", new Date())
                : new Date(),
              supplierInvoiceItems: data.supplierInvoiceItems.map(
                (supplierInvoiceItem) => {
                  return {
                    ...supplierInvoiceItem,
                    id: nanoid(),
                  };
                }
              ),
            } as SupplierInvoiceWithItems)
          : undefined,
      [data]
    ),
    // data,
    isLoading,
    extractInvoiceInfo,
  };
};
