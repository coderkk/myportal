import { TRPCError } from "@trpc/server";
import { S3 } from "aws-sdk";
import type { FileArray, FileData } from "chonky";
import path from "path";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { createTRPCRouter, protectedProcedure } from "../trpc";

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
});

export const deleteS3ObjectSchema = z.object({
  prefix: z.string(),
  fileId: z.string(),
});

export const getPreSignedURLForDownloadSchema = z.object({
  fileId: z.string(),
});

export const getPreSignedURLForUploadSchema = z.object({
  fileId: z.string(),
});

export const s3Router = createTRPCRouter({
  fetchS3BucketContents: protectedProcedure
    .input(fetchS3BucketContentsSchema)
    .query(async ({ input }) => {
      try {
        const data = await s3
          .listObjectsV2({
            Bucket: env.AWS_S3_BUCKET_NAME_,
            Delimiter: "/",
            Prefix: input.prefix !== "/" ? input.prefix : "",
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
        // we don't return the directory that we are in (exclude ".test" for example)
        return chonkyFiles.filter((file) => {
          if (file && !file.isDir && file.size === 0 && file.id.endsWith("/")) {
            return false;
          }
          return true;
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
    .mutation(async ({ input }) => {
      try {
        // get presigned url to delete
        return await s3
          .deleteObject({
            Bucket: env.AWS_S3_BUCKET_NAME_,
            Key: input.fileId,
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
  getPreSignedURLForDownload: protectedProcedure // mutation because we're creating a presigned url, although no data are mutated in our db
    .input(getPreSignedURLForDownloadSchema)
    .mutation(({ input }) => {
      try {
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
    .mutation(({ input }) => {
      try {
        const preSignedURLForUpload = s3.getSignedUrl("putObject", {
          Bucket: env.AWS_S3_BUCKET_NAME_,
          Key: input.fileId,
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
});
