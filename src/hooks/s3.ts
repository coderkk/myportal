import { api } from "../utils/api";

export const useFetchS3BucketContents = ({ prefix }: { prefix: string }) => {
  const { data, isError } = api.s3.fetchS3BucketContents.useQuery({
    prefix: prefix,
  });
  return {
    chonkyFiles: data,
    isFetchS3BucketContentsError: isError,
  };
};

export const useDeleteS3Object = () => {
  const utils = api.useContext();
  const { mutateAsync: deleteS3Object } = api.s3.deleteS3Object.useMutation({
    async onMutate({ prefix, fileId }) {
      await utils.s3.fetchS3BucketContents.cancel();
      const previousData = utils.s3.fetchS3BucketContents.getData();
      utils.s3.fetchS3BucketContents.setData(
        {
          prefix: prefix,
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
          },
          previousData
        );
    },
    onError(error, values, rollback) {
      if (rollback) {
        rollback();
      }
    },
    onSuccess(data, { prefix, fileId }) {
      utils.s3.fetchS3BucketContents.setData(
        {
          prefix: prefix,
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
