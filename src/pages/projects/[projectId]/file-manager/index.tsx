import type { ChonkyFileActionData, FileArray, FileData } from "chonky";
import {
  ChonkyActions,
  FileBrowser,
  FileContextMenu,
  FileHelper,
  FileList,
  FileNavbar,
  FileToolbar,
} from "chonky";
import path from "path";
import React, { useCallback, useMemo, useRef, useState } from "react";
import SessionAuth from "../../../../components/auth/SessionAuth";
import { env } from "../../../../env/client.mjs";
import {
  useCreateFolder,
  useDeleteS3Object,
  useFetchS3BucketContents,
  useGetPreSignedURLForDownload,
  useGetPreSignedURLForUpload,
} from "../../../../hooks/s3";
import { api } from "../../../../utils/api";

const S3Browser = () => {
  const utils = api.useContext();
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);
  const hiddenAnchorRef = useRef<HTMLAnchorElement | null>(null);
  const [folderPrefix, setKeyPrefix] = useState<string>("/");

  const { chonkyFiles, isFetchS3BucketContentsError } =
    useFetchS3BucketContents({
      prefix: folderPrefix,
    });

  const { deleteS3Object } = useDeleteS3Object();

  const { getPreSignedURLForDownload } = useGetPreSignedURLForDownload();

  const { getPreSignedURLForUpload } = useGetPreSignedURLForUpload();

  const { createFolder } = useCreateFolder();

  const handleDownloadFile = useCallback(
    async (fileData: FileData) => {
      const { preSignedURLForDownload } = await getPreSignedURLForDownload({
        fileId: fileData.id,
      });
      fetch(preSignedURLForDownload, {
        method: "GET",
      })
        .then((res) => res.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(new Blob([blob]));
          if (hiddenAnchorRef.current) {
            hiddenAnchorRef.current.href = url;
            hiddenAnchorRef.current.download = fileData.name;
            hiddenAnchorRef.current.click();
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    [getPreSignedURLForDownload]
  );

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files[0]) {
      void handleUploadFile(files[0]);
    }
  };

  const handleUploadFile = async (file: File) => {
    setUploadingFile(true);
    const fileId = folderPrefix === "/" ? file.name : folderPrefix + file.name;
    const { preSignedURLForUpload } = await getPreSignedURLForUpload({
      fileId: fileId,
    });
    fetch(preSignedURLForUpload, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setUploadingFile(false);
        void utils.s3.fetchS3BucketContents.invalidate(); // refetch bucket contents
      });
  };

  const folderChain = useMemo(() => {
    let folderChain: FileArray;
    if (folderPrefix === "/") {
      folderChain = [];
    } else {
      let currentPrefix = "";
      folderChain = folderPrefix
        .replace(/\/*$/, "")
        .split("/")
        .map((prefixPart): FileData => {
          currentPrefix = currentPrefix
            ? path.join(currentPrefix, prefixPart)
            : prefixPart;
          return {
            id: currentPrefix,
            name: prefixPart,
            isDir: true,
          };
        });
    }
    folderChain.unshift({
      id: "/",
      name: env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
      isDir: true,
    });
    return folderChain;
  }, [folderPrefix]);

  const handleFileAction = useCallback(
    (data: ChonkyFileActionData) => {
      if (data.id === ChonkyActions.OpenFiles.id) {
        const { targetFile, files } = data.payload;
        const fileToOpen = targetFile ?? files[0];
        if (fileToOpen && FileHelper.isDirectory(fileToOpen)) {
          const newPrefix = `${fileToOpen.id.replace(/\/*$/, "")}/`;
          setKeyPrefix(newPrefix);
        }
      } else if (data.id === ChonkyActions.DeleteFiles.id) {
        for (const file of data.state.selectedFilesForAction) {
          void deleteS3Object({
            prefix: folderPrefix,
            fileId: file.id,
          });
        }
      } else if (data.id === ChonkyActions.DownloadFiles.id) {
        for (const file of data.state.selectedFilesForAction) {
          if (file.isDir) continue; // add toast
          void handleDownloadFile(file);
        }
      } else if (data.id === ChonkyActions.UploadFiles.id) {
        hiddenFileInputRef.current?.click();
      } else if (data.id === ChonkyActions.CreateFolder.id) {
        const folderName = prompt("Provide the name for your new folder:");
        if (folderName)
          void createFolder({
            prefix: folderPrefix,
            folderName: folderName,
          });
      }
    },
    [createFolder, deleteS3Object, folderPrefix, handleDownloadFile]
  );

  const fileActions = [
    ChonkyActions.CreateFolder,
    ChonkyActions.UploadFiles,
    ChonkyActions.DownloadFiles,
    ChonkyActions.DeleteFiles,
  ];

  return (
    <SessionAuth>
      {isFetchS3BucketContentsError ? (
        <div>Fetch error!</div>
      ) : (
        <div>
          <div className="h-96 w-10/12">
            <FileBrowser
              files={
                chonkyFiles
                  ? chonkyFiles
                  : Array.from({ length: 3 }, () => null)
              }
              folderChain={folderChain}
              onFileAction={handleFileAction}
              fileActions={fileActions}
            >
              <FileNavbar />
              <FileToolbar />
              <FileList />
              <FileContextMenu />
              <input
                type="file"
                aria-label="input"
                ref={hiddenFileInputRef}
                onChange={handleFileInputChange}
                className="hidden"
              />
              <a ref={hiddenAnchorRef} />
            </FileBrowser>
            {uploadingFile && <div>Uploading file...</div>}
          </div>
        </div>
      )}
    </SessionAuth>
  );
};

export default S3Browser;
