import { useRouter } from "next/router";
import { useRef, useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import PermissionToProject from "../../../../components/auth/PermissionToProject";
import SessionAuth from "../../../../components/auth/SessionAuth";
import type { SupplierInvoiceItem } from "../../../../components/invoice/InvoiceItem";
import { env } from "../../../../env/client.mjs";
import { useGetPreSignedURLForDownload } from "../../../../hooks/s3";

import InvoiceEditableForm from "../../../../components/invoice/InvoiceEditableForm";
import {
  useGetSupplierInvoice,
  useUpdateSupplierInvoice,
} from "../../../../hooks/supplierInvoice";
import type { SupplierInvoiceWithItems } from "./import";

const SupplierInvoiceView = () => {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const supplierInvoiceId = router.query.supplierInvoiceId as string;
  const hiddenAnchorRef = useRef<HTMLAnchorElement | null>(null);

  const [supplierInvoiceItems, setSupplierInvoiceItems] = useState<
    SupplierInvoiceItem[] | undefined
  >(undefined);

  const { supplierInvoiceData, isLoading } = useGetSupplierInvoice({
    supplierInvoiceId: supplierInvoiceId,
    onSucess: (supplierInvoiceItems: SupplierInvoiceItem[]) =>
      setSupplierInvoiceItems(supplierInvoiceItems),
  });

  const { updateSupplierInvoice } = useUpdateSupplierInvoice({
    projectId: projectId,
  });

  const { getPreSignedURLForDownload } = useGetPreSignedURLForDownload();

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

  const useFormReturn = useForm<SupplierInvoiceWithItems>({
    values: supplierInvoiceData,
  });

  supplierInvoiceData?.fileId;

  const onSubmit = (
    data: SupplierInvoiceWithItems,
    e: BaseSyntheticEvent<object, unknown, unknown> | undefined
  ) => {
    e?.preventDefault();
    updateSupplierInvoice({
      ...data,
      projectId: projectId,
      fileId: data.fileId || undefined,
      supplierInvoiceItems: supplierInvoiceItems || [],
    });
    void router.push("/projects/" + projectId + "/invoice/");
  };

  const handleDownloadFile = async () => {
    try {
      const fileId = supplierInvoiceData?.fileId;
      if (fileId) {
        const { preSignedURLForDownload } = await getPreSignedURLForDownload({
          fileId: projectId + "/" + fileId,
          projectId: projectId,
          aws_s3_bucket_name: env.NEXT_PUBLIC_AWS_S3_INVOICES_BUCKET_NAME,
        });
        const res = await fetch(preSignedURLForDownload, {
          method: "GET",
        });
        const url = window.URL.createObjectURL(new Blob([await res.blob()]));
        if (hiddenAnchorRef.current) {
          hiddenAnchorRef.current.href = url;
          hiddenAnchorRef.current.download = fileId;
          hiddenAnchorRef.current.click();
        }
      }
    } catch (error) {
      toast.error("Error when downloading file");
      // This try catch is necessary as getPreSignedURLForDownload
      // returns a promise that can possibly cause a runtime error.
      // we handle this error in src/utils/api.ts so there's no need
      // to do anything here other than catch the error.
    }
  };

  return (
    <SessionAuth>
      <PermissionToProject projectId={projectId}>
        <main>
          <div className="pt-5">
            <InvoiceEditableForm
              onSubmit={onSubmit}
              fileId={supplierInvoiceData?.fileId || undefined}
              handleDownloadFile={handleDownloadFile}
              useFormReturn={useFormReturn}
              supplierInvoiceItems={supplierInvoiceItems}
              setSupplierInvoiceItems={setSupplierInvoiceItems}
              onInvoiceUpdate={onInvoiceUpdate}
              removeInvoiceItem={removeInvoiceItem}
              isLoading={isLoading}
            />
            <a ref={hiddenAnchorRef} />
          </div>
        </main>
      </PermissionToProject>
    </SessionAuth>
  );
};

export default SupplierInvoiceView;
