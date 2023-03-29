import type { ChonkyFileActionData, FileArray, FileData } from "chonky";
import {
  ChonkyActions,
  FileBrowser,
  FileContextMenu,
  FileList,
  FileNavbar,
  FileToolbar,
} from "chonky";
import path from "path";
import React, { useCallback, useRef, useState } from "react";
import SessionAuth from "../../../../components/auth/SessionAuth";
import { env } from "../../../../env/client.mjs";
import {
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

  // function concatenate(arrays: Uint8Array[]) {
  //   if (!arrays.length) return null;
  //   const totalLength = arrays.reduce((acc, value) => acc + value.length, 0);
  //   const result = new Uint8Array(totalLength);
  //   let length = 0;
  //   for (const array of arrays) {
  //     result.set(array, length);
  //     length += array.length;
  //   }
  //   return result;
  // }

  // function getContentLength(url: string) {
  //   return new Promise<number>((resolve, reject) => {
  //     const xhr = new XMLHttpRequest();
  //     xhr.open("GET", url);
  //     xhr.send();
  //     xhr.onload = function () {
  //       const contentLengthResponseHeader =
  //         xhr.getResponseHeader("Content-Length");
  //       if (contentLengthResponseHeader) resolve(~~contentLengthResponseHeader);
  //     };
  //     xhr.onerror = reject;
  //   });
  // }

  // function getBinaryContent(
  //   url: string,
  //   start: number,
  //   end: number,
  //   i: number
  // ) {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       const xhr = new XMLHttpRequest();
  //       xhr.open("GET", url, true);
  //       xhr.setRequestHeader("range", `bytes=${start}-${end}`); // Set range request information
  //       xhr.responseType = "arraybuffer"; // Set the returned type to arraybuffer
  //       xhr.onload = function () {
  //         resolve({
  //           index: i, // file block index
  //           buffer: xhr.response,
  //         });
  //       };
  //       xhr.send();
  //     } catch (err) {
  //       console.error(err);
  //       reject("error");
  //     }
  //   });
  // }

  // function saveAs({
  //   name,
  //   buffer,
  //   mime = "application/octet-stream",
  // }: {
  //   name: string;
  //   buffer: Uint8Array;
  //   mime: string;
  // }) {
  //   const blob = new Blob([buffer], { type: mime });
  //   const blobUrl = URL.createObjectURL(blob);
  //   if (hiddenAnchorRef.current) {
  //     hiddenAnchorRef.current.download = name || Math.random().toString();
  //     hiddenAnchorRef.current.href = blobUrl;
  //     hiddenAnchorRef.current.click();
  //   }
  //   URL.revokeObjectURL(blobUrl);
  // }

  // async function asyncPool(
  //   concurrency: number,
  //   iterable: number[],
  //   iteratorFn: (i: number) => Promise<unknown>
  // ) {
  //   const ret = []; // Store all asynchronous tasks
  //   const executing = new Set(); // Stores executing asynchronous tasks
  //   for (const item of iterable) {
  //     // Call the iteratorFn function to create an asynchronous task
  //     const p = Promise.resolve().then(() => iteratorFn(item, iterable));

  //     ret.push(p); // save new async task
  //     executing.add(p); // Save an executing asynchronous task

  //     const clean = () => executing.delete(p);
  //     p.then(clean).catch(clean);
  //     if (executing.size >= concurrency) {
  //       // Wait for faster task execution to complete
  //       await Promise.race(executing);
  //     }
  //   }
  //   return Promise.all(ret);
  // }

  // const download = useCallback(
  //   async ({
  //     url,
  //     chunkSize,
  //     poolLimit = 1,
  //   }: {
  //     url: string;
  //     chunkSize: number;
  //     poolLimit: number;
  //   }) => {
  //     const contentLength = await getContentLength(url);
  //     console.log(contentLength);
  //     const chunks = Math.ceil(contentLength / chunkSize);
  //     const results = await asyncPool(
  //       poolLimit,
  //       [...new Array(chunks).keys()],
  //       (i: number) => {
  //         const start = i * chunkSize;
  //         const end =
  //           i + 1 == chunks ? contentLength - 1 : (i + 1) * chunkSize - 1;
  //         return getBinaryContent(url, start, end, i);
  //       }
  //     );
  //     const sortedBuffers = results.map((item) => new Uint8Array(item.buffer));
  //     return concatenate(sortedBuffers);
  //   },
  //   []
  // );

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

  const folderChain = React.useMemo(() => {
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
        if (data.payload.files && data.payload.files.length !== 1) return; // add toast
        if (!data.payload.targetFile || !data.payload.targetFile.isDir) return; // add toast
        const newPrefix = `${data.payload.targetFile.id.replace(/\/*$/, "")}/`;
        setKeyPrefix(newPrefix);
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
      }
    },
    [deleteS3Object, folderPrefix, handleDownloadFile]
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
      ) : uploadingFile ? (
        <div>Uploading file</div>
      ) : (
        <div>
          <div className="h-96 w-10/12">
            <FileBrowser
              files={
                chonkyFiles
                  ? chonkyFiles
                  : Array.from(
                      { length: Math.floor(Math.random() * 3) + 1 },
                      () => null
                    )
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
          </div>
        </div>
      )}
    </SessionAuth>
  );
};

export default S3Browser;
