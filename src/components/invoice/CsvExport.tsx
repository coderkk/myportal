import { ExportToCsv } from "export-to-csv";
import { Fragment, useEffect } from "react";
import toast from "react-hot-toast";
import { useGetSupplierInvoicesForCSVDownload } from "../../hooks/supplierInvoice";

const CsvExport = ({ projectId }: { projectId: string }) => {
  const { data, isCSVDataLoading, getSupplierInvoicesForCSVDownload } =
    useGetSupplierInvoicesForCSVDownload();

  useEffect(() => {
    if (data) {
      const csvExporter = new ExportToCsv({
        fieldSeparator: ",",
        quoteStrings: '"',
        decimalSeparator: ".",
        showLabels: true,
        useTextFile: false,
        useBom: true,
        headers: [
          "Invoice Number",
          "Invoice Date",
          "Cost Code",
          "Supplier Name",
          "Tax",
          "Discount",
          "Grand Total",
          "Description",
          "Quantity",
          "Unit",
          "Unit Price",
          "Total Price",
        ],
        filename: "invoices",
      });
      csvExporter.generateCsv(data);
    }
  }, [data]);

  return (
    <Fragment>
      <button
        type="button"
        onClick={() =>
          void (async () => {
            if (isCSVDataLoading) {
              return;
            }
            try {
              await getSupplierInvoicesForCSVDownload({
                projectId: projectId,
              });
            } catch (e) {
              toast.error("Error exporting to CSV");
            }
          })()
        }
        disabled={isCSVDataLoading}
        className="mx-2 block rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        {isCSVDataLoading ? "Exporting..." : "Export to CSV"}
      </button>
    </Fragment>
  );
};

export default CsvExport;
