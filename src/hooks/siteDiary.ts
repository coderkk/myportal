import type { siteDiary } from "../pages/projects/[projectId]/site-diary/[siteDiaryId]";
import { api } from "../utils/api";

export const useGetSiteDiary = ({
  siteDiaryId,
  initialData,
}: {
  siteDiaryId: string;
  initialData: siteDiary;
}) => {
  const { data, isError } = api.siteDiary.getSiteDiaryInfo.useQuery(
    {
      siteDiaryId: siteDiaryId,
    },
    {
      initialData: {
        siteDiary: initialData,
      },
      staleTime: 0, // this is the default but putting it here to remind devs
    }
  );
  return {
    siteDiary: data.siteDiary,
    isError: isError,
  };
};
