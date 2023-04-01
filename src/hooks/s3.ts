import { api } from "../utils/api";

export const useFetchS3BucketContents = ({
  prefix,
  projectId,
}: {
  prefix: string;
  projectId: string;
}) => {
  const { data, isError } = api.s3.fetchS3BucketContents.useQuery({
    prefix: prefix,
    projectId: projectId,
  });
  return {
    chonkyFiles: data,
    isFetchS3BucketContentsError: isError,
  };
};

export const useDeleteS3Object = () => {
  const utils = api.useContext();
  const { mutateAsync: deleteS3Object } = api.s3.deleteS3Object.useMutation({
    async onMutate({ prefix, fileId, projectId }) {
      await utils.s3.fetchS3BucketContents.cancel();
      const previousData = utils.s3.fetchS3BucketContents.getData();
      utils.s3.fetchS3BucketContents.setData(
        {
          prefix: prefix,
          projectId: projectId,
        },
        (oldFileData) => {
          if (oldFileData) {
            const newFileData = oldFileData?.filter(
              (oldFileDatum) => oldFileDatum?.id !== fileId
            );
            return newFileData;
          } else {
            return oldFileData;
          }
        }
      );
      return () =>
        utils.s3.fetchS3BucketContents.setData(
          {
            prefix: prefix,
            projectId: projectId,
          },
          previousData
        );
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    onSuccess(data, { prefix, fileId, projectId }) {
      utils.s3.fetchS3BucketContents.setData(
        {
          prefix: prefix,
          projectId: projectId,
        },
        (oldFileData) => {
          if (oldFileData) {
            const newFileData = oldFileData?.filter(
              (oldFileDatum) => oldFileDatum?.id !== fileId
            );
            return newFileData;
          } else {
            return oldFileData;
          }
        }
      );
    },
    async onSettled() {
      await utils.s3.fetchS3BucketContents.invalidate();
    },
  });
  return {
    deleteS3Object,
  };
};

export const useGetPreSignedURLForDownload = () => {
  const { mutateAsync: getPreSignedURLForDownload } =
    api.s3.getPreSignedURLForDownload.useMutation();
  return {
    getPreSignedURLForDownload: getPreSignedURLForDownload,
  };
};

export const useGetPreSignedURLForUpload = () => {
  const { mutateAsync: getPreSignedURLForUpload } =
    api.s3.getPreSignedURLForUpload.useMutation();
  return {
    getPreSignedURLForUpload: getPreSignedURLForUpload,
  };
};

export const useCreateFolder = () => {
  const utils = api.useContext();
  const { mutateAsync: createFolder } = api.s3.createFolder.useMutation({
    async onSettled() {
      await utils.s3.fetchS3BucketContents.invalidate();
    },
  });
  return {
    createFolder,
  };
};
