import toast from "react-hot-toast";
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

export const useGetMyProfessionalRole = ({
  projectId,
}: {
  projectId: string;
}) => {
  const { data, isLoading } = api.me.getMyProfessionalRole.useQuery({
    projectId: projectId,
  });
  return {
    myProfessionalRole: data,
    isLoading: isLoading,
  };
};

export const useUpdateMyProfessionalRole = () => {
  const { mutate: updateMyProfessionalRole } =
    api.me.updateMyProfessionalRole.useMutation({
      onSuccess: () => {
        toast.success("Updated your professional role");
      },
    });
  return {
    updateMyProfessionalRole,
  };
};
