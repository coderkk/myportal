import { TRPCError } from "@trpc/server";
import { S3 } from "aws-sdk";
import type { Delete } from "aws-sdk/clients/s3";
import type { FileArray, FileData } from "chonky";
import path from "path";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { userHasPermissionToProject } from "./me";

const s3Config = {
  apiVersion: "latest",
  region: env.AWS_S3_BUCKET_REGION_,
  accessKeyId: env.AWS_ACCESS_KEY_ID_,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY_,
  signatureVersion: "v4",
};

const s3 = new S3(s3Config);

export const fetchS3BucketContentsSchema = z.object({
  prefix: z.string(),
  projectId: z.string(),
});

export const deleteS3ObjectSchema = z.object({
  prefix: z.string(),
  fileId: z.string(),
  projectId: z.string(),
});

export const getPreSignedURLForDownloadSchema = z.object({
  fileId: z.string(),
  projectId: z.string(),
});

export const getPreSignedURLForUploadSchema = z.object({
  fileId: z.string(),
  projectId: z.string(),
});

export const createFolderSchema = z.object({
  prefix: z.string(),
  folderName: z.string(),
  projectId: z.string(),
});

const removeFromStringIfStartsWith = (
  inputString: string,
  stringToRemove: string
) => {
  if (inputString.startsWith(stringToRemove)) {
    return inputString.substring(stringToRemove.length); // +1 for forward slash
  }
  return inputString;
};

export const s3Router = createTRPCRouter({
  fetchS3BucketContents: protectedProcedure
    .input(fetchS3BucketContentsSchema)
    .query(async ({ ctx, input }) => {
      try {
        if (
          !(await userHasPermissionToProject({
            ctx,
            projectId: input.projectId,
          }))
        )
          throw new TRPCError({
            code: "UNAUTHORIZED",
          });
        const prefix =
          input.prefix !== "/"
            ? input.projectId + "/" + input.prefix
            : input.projectId + "/";
        const data = await s3
          .listObjectsV2({
            Bucket: env.AWS_S3_BUCKET_NAME_,
            Delimiter: "/",
            Prefix: prefix,
          })
          .promise();
        const chonkyFiles: FileArray = [];
        const s3Objects = data.Contents;
        const s3Prefixes = data.CommonPrefixes;

        // objects could be files or "directories"
        if (s3Objects) {
          chonkyFiles.push(
            ...s3Objects.flatMap((object): FileData | never[] => {
              if (object.Key) {
                return {
                  id: object.Key,
                  name: path.basename(object.Key),
                  modDate: object.LastModified,
                  size: object.Size,
                };
              }
              return [];
            })
          );
        }

        // prefixes are "directories" in this "directory"
        if (s3Prefixes) {
          chonkyFiles.push(
            ...s3Prefixes.flatMap((prefix): FileData | never[] => {
              if (!prefix.Prefix) {
                return [];
              }
              return {
                id: prefix.Prefix,
                name: path.basename(prefix.Prefix),
                isDir: true,
              };
            })
          );
        }
        return chonkyFiles
          .filter((file) => {
            // we don't return the file of the directory that we are in (exclude ".test" for example)
            if (file && !file.isDir && file.id.endsWith("/")) {
              return false;
            }
            return true;
          })
          .map((file) => {
            if (file && file.isDir) {
              let fileId = file.id;
              fileId = file?.id.substring(0, file?.id.length - 1);
              return {
                ...file,
                name: removeFromStringIfStartsWith(fileId || "", prefix),
              };
            }
            return file;
          });
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  deleteS3Object: protectedProcedure
    .input(deleteS3ObjectSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (
          !(await userHasPermissionToProject({
            ctx,
            projectId: input.projectId,
          }))
        )
          throw new TRPCError({
            code: "UNAUTHORIZED",
          });
        const deleteHelper = async (bucket: string, dir: string) => {
          const listParams = {
            Bucket: bucket,
            Prefix: dir,
          };
          const listedObjects = await s3.listObjectsV2(listParams).promise();
          if (listedObjects.Contents?.length === 0) return;
          const deleteParams: {
            Bucket: string;
            Delete: Delete;
          } = {
            Bucket: bucket,
            Delete: { Objects: [] },
          };
          listedObjects.Contents?.forEach(({ Key }) => {
            if (Key) deleteParams.Delete.Objects.push({ Key });
          });
          await s3.deleteObjects(deleteParams).promise();
          if (listedObjects.IsTruncated) await deleteHelper(bucket, dir); // listObjectsV2 has a MaxKeys and the number of files may be >MaxKeys
        };
        return await deleteHelper(env.AWS_S3_BUCKET_NAME_, input.fileId);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  getPreSignedURLForDownload: protectedProcedure // mutation because we're creating a presigned url, although no data are mutated in our db
    .input(getPreSignedURLForDownloadSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (
          !(await userHasPermissionToProject({
            ctx,
            projectId: input.projectId,
          }))
        )
          throw new TRPCError({
            code: "UNAUTHORIZED",
          });
        const preSignedURLForDownload = s3.getSignedUrl("getObject", {
          Bucket: env.AWS_S3_BUCKET_NAME_,
          Key: input.fileId,
          Expires: 900, // 15 mins
        });
        return {
          preSignedURLForDownload: preSignedURLForDownload,
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  getPreSignedURLForUpload: protectedProcedure // mutation because we're creating a presigned url, although no data are mutated in our db
    .input(getPreSignedURLForUploadSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        if (
          !(await userHasPermissionToProject({
            ctx,
            projectId: input.projectId,
          }))
        )
          throw new TRPCError({
            code: "UNAUTHORIZED",
          });
        const preSignedURLForUpload = s3.getSignedUrl("putObject", {
          Bucket: env.AWS_S3_BUCKET_NAME_,
          Key: input.projectId + "/" + input.fileId,
          Expires: 900, // 15 mins
        });
        return {
          preSignedURLForUpload: preSignedURLForUpload,
        };
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
  createFolder: protectedProcedure
    .input(createFolderSchema)
    .mutation(async ({ ctx, input }) => {
      // no need to check if a folder exists as even if it overwrites, the files in the folder will still be there
      try {
        if (
          !(await userHasPermissionToProject({
            ctx,
            projectId: input.projectId,
          }))
        )
          throw new TRPCError({
            code: "UNAUTHORIZED",
          });
        let key =
          input.prefix === "/"
            ? input.folderName
            : input.prefix + input.folderName;
        key = key.replace(/\/g/, "_"); // sanitize,
        if (key[0] === "_") {
          key = key.substring(1, key.length);
        }
        const prefix = removeFromStringIfStartsWith(key, input.projectId);
        if (prefix === "") {
          key = `${input.projectId}/`; // the "/" at the end tells s3 to create a folder
        } else {
          key = `${input.projectId}/${prefix}/`;
        }
        return await s3
          .upload({
            Bucket: env.AWS_S3_BUCKET_NAME_,
            Key: key,
            Body: "body does not matter", // needs to be here for api compatibility
          })
          .promise();
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: (error as Error).message,
          cause: error,
        });
      }
    }),
});
