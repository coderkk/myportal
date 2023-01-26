import { api } from "../utils/api";

export type siteDiary = {
  id: string;
  name: string;
  date: string;
  createdBy: string | null;
};

export const useGetSiteDiaries = ({ projectId }: { projectId: string }) => {
  const { data, isLoading, isError } = api.siteDiary.getSiteDiaries.useQuery({
    projectId: projectId,
  });
  return {
    siteDiaries: data?.siteDiaries,
    isLoading: isLoading,
    isError: isError,
  };
};

export const useGetSiteDiary = ({ siteDiaryId }: { siteDiaryId: string }) => {
  const { data, isLoading, isError } = api.siteDiary.getSiteDiary.useQuery({
    siteDiaryId: siteDiaryId,
  });
  return {
    siteDiary: data?.siteDiary,
    isLoading: isLoading,
    isError: isError,
  };
};
