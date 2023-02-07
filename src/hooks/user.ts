import { api } from "../utils/api";

export type siteDiary = {
  id: string;
  name: string;
  date: string;
  createdBy: string | null;
};

export const useGetUsers = () => {
  const { data, isLoading, isError } = api.user.getUsers.useQuery();
  return {
    users: data,
    isLoading: isLoading,
    isError: isError,
  };
};

export const useGetUsersForProject = ({ projectId }: { projectId: string }) => {
  const { data, isLoading, isError } = api.user.getUsersForProject.useQuery({
    projectId: projectId,
  });
  return {
    usersForProject: data,
    isLoading: isLoading,
    isError: isError,
  };
};
