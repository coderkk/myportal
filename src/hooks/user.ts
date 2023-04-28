import { api } from "../utils/api";

export const useGetUsers = () => {
  const { data, isLoading } = api.user.getUsers.useQuery();
  return {
    users: data,
    isLoading: isLoading,
  };
};

export const useGetUsersForProject = ({ projectId }: { projectId: string }) => {
  const { data, isLoading } = api.user.getUsersForProject.useQuery({
    projectId: projectId,
  });
  return {
    usersForProject: data,
    isLoading: isLoading,
  };
};
