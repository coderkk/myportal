import { useRouter } from "next/router";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import InvoiceEditableForm from "../../../../components/invoice/InvoiceEditableForm";
import type { SupplierInvoiceItem } from "../../../../components/invoice/InvoiceItem";
import { useCreateSupplierInvoice } from "../../../../hooks/supplierInvoice";
import type { SupplierInvoiceWithItems } from "./import";

const AddInvoicePage = ({}) => {
  const router = useRouter();
  const projectId = router.query.projectId as string;

  const [supplierInvoiceItems, setSupplierInvoiceItems] = useState<
    SupplierInvoiceItem[] | undefined
  >([]);

  const { createSupplierInvoice } = useCreateSupplierInvoice();

  const useFormReturn = useForm<SupplierInvoiceWithItems>();

  const onSubmit = (
    data: SupplierInvoiceWithItems,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    createSupplierInvoice({
      ...data,
      projectId: projectId,
      fileId: data.fileId || undefined,
      supplierInvoiceItems: supplierInvoiceItems || [],
    });
    void router.push("/projects/" + projectId + "/invoice/");
  };

  const onInvoiceUpdate = (invoiceItem: SupplierInvoiceItem, index: number) => {
    if (!supplierInvoiceItems) return;
    const newSupplierInvoiceItems = [...supplierInvoiceItems];
    newSupplierInvoiceItems[index] = invoiceItem;
    setSupplierInvoiceItems(newSupplierInvoiceItems);
  };

  const removeInvoiceItem = (index: number) => {
    if (!supplierInvoiceItems) return;
    const newSupplierInvoiceItems = [...supplierInvoiceItems];
    newSupplierInvoiceItems.splice(index, 1);
    setSupplierInvoiceItems(newSupplierInvoiceItems);
  };

  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        <InvoiceEditableForm
          onSubmit={onSubmit}
          fileId={undefined}
          useFormReturn={useFormReturn}
          supplierInvoiceItems={supplierInvoiceItems}
          setSupplierInvoiceItems={setSupplierInvoiceItems}
          onInvoiceUpdate={onInvoiceUpdate}
          removeInvoiceItem={removeInvoiceItem}
        />
      </PermissionToProject>
    </SessionAuth>
  );
};

export default AddInvoicePage;
