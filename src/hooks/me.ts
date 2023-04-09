import { api } from "../utils/api";

export const useHasPermissionToProject = ({
  projectId,
}: {
  projectId: string;
}) => {
  const { data, isLoading, isError } = api.me.hasPermissionToProject.useQuery(
    {
      projectId: projectId,
    },
    {
      retry: false,
    }
  );
  return {
    hasPermission: data,
    isLoading: isLoading,
    isError: isError,
  };
};

export const useIsCreatorOfProject = ({ projectId }: { projectId: string }) => {
  const { data, isLoading } = api.me.isCreatorOfProject.useQuery({
    projectId: projectId,
  });
  return {
    isCreator: data,
    isLoading: isLoading,
  };
};
