import { useAtom } from "jotai";
import { usersForProjectMutationCountAtom } from "../atoms/userAtoms";
import { api } from "../utils/api";

export const useGetUsers = () => {
  const { data, isLoading } = api.user.getUsers.useQuery();
  return {
    users: data,
    isLoading: isLoading,
  };
};

export const useGetUsersForProject = ({ projectId }: { projectId: string }) => {
  const [usersForProjectMutationCount] = useAtom(
    usersForProjectMutationCountAtom
  );
  const { data, isLoading } = api.user.getUsersForProject.useQuery(
    {
      projectId: projectId,
    },
    {
      enabled: usersForProjectMutationCount === 0,
    }
  );
  return {
    usersForProject: data,
    isLoading: isLoading,
  };
};
