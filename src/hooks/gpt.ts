import { api } from "../utils/api";

export const useExtractInvoiceInfo = () => {
  const {
    data,
    isLoading,
    mutateAsync: extractInvoiceInfo,
  } = api.gpt.extractInvoiceInfo.useMutation();
  return {
    data,
    isLoading,
    extractInvoiceInfo,
  };
};
