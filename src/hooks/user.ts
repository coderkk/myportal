import { api } from "../utils/api";

export type siteDiary = {
  id: string;
  name: string;
  date: string;
  createdBy: string | null;
};

export const useGetUsersForProject = ({ projectId }: { projectId: string }) => {
  const { data, isLoading, isError } = api.user.getUsersForProject.useQuery({
    projectId: projectId,
  });
  return {
    users: data,
    isLoading: isLoading,
    isError: isError,
  };
};
