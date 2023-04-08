import type { ChonkyFileActionData, FileArray, FileData } from "chonky";
import {
  ChonkyActions,
  FileBrowser,
  FileContextMenu,
  FileHelper,
  FileList,
  FileNavbar,
  FileToolbar,
  setChonkyDefaults,
} from "chonky";
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import { useRouter } from "next/router";
import path from "path";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import SessionAuth from "../../../../components/auth/SessionAuth";
import {
  useCreateFolder,
  useDeleteS3Object,
  useFetchS3BucketContents,
  useGetPreSignedURLForDownload,
  useGetPreSignedURLForUpload,
} from "../../../../hooks/s3";
import { api } from "../../../../utils/api";

const S3Browser = () => {
  const router = useRouter();
  const utils = api.useContext();
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);
  const hiddenAnchorRef = useRef<HTMLAnchorElement | null>(null);
  const [folderPrefix, setFolderPrefix] = useState<string>("/");
  const mounted = useRef<boolean>(false);
  const projectId = router.query.projectId as string;

  const { chonkyFiles, isFetchS3BucketContentsError } =
    useFetchS3BucketContents({
      prefix: folderPrefix,
      projectId: projectId,
    });

  const { deleteS3Object } = useDeleteS3Object();

  const { getPreSignedURLForDownload } = useGetPreSignedURLForDownload();

  const { getPreSignedURLForUpload } = useGetPreSignedURLForUpload();

  const { createFolder } = useCreateFolder();

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setChonkyDefaults({
        iconComponent: ChonkyIconFA,
        disableDragAndDrop: true,
      });
    }
  }, []);

  const handleDownloadFile = useCallback(
    async (fileData: FileData) => {
      try {
        const { preSignedURLForDownload } = await getPreSignedURLForDownload({
          fileId: fileData.id,
          projectId: projectId,
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
          .catch(() => {
            // avoid eslint error
          });
      } catch (error) {
        // This try catch is necessary as getPreSignedURLForDownload
        // returns a promise that can possibly cause a runtime error.
        // we handle this error in src/utils/api.ts so there's no need
        // to do anything here other than catch the error.
      }
    },
    [getPreSignedURLForDownload, projectId]
  );

  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files[0]) {
      const fileName = files[0].name;
      // if exists, don't upload
      chonkyFiles?.map((file) => {
        if (file?.name == fileName) {
          toast.error("Duplicate file name. Delete existing file first");
          return;
        }
      });
      await handleUploadFile(files[0]);
      event.target.value = ""; // clear the input
    }
  };

  const handleUploadFile = useCallback(
    async (file: File) => {
      setUploadingFile(true);
      const fileId =
        folderPrefix === "/" ? file.name : folderPrefix + file.name;
      try {
        const { preSignedURLForUpload } = await getPreSignedURLForUpload({
          fileId: fileId,
          projectId: projectId,
        });
        fetch(preSignedURLForUpload, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        }).catch(() => {
          // avoid eslint error
        });
      } catch (error) {
        // This try catch is necessary as getPreSignedURLForDownload
        // returns a promise that can possibly cause a runtime error.
        // we handle this error in src/utils/api.ts so there's no need
        // to do anything here other than catch the error.
      } finally {
        setUploadingFile(false);
        void utils.s3.fetchS3BucketContents.invalidate(); // refetch bucket contents
      }
    },
    [
      folderPrefix,
      getPreSignedURLForUpload,
      projectId,
      utils.s3.fetchS3BucketContents,
    ]
  );

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
      name: projectId,
      isDir: true,
    });
    return folderChain;
  }, [folderPrefix, projectId]);

  const handleFileAction = useCallback(
    (data: ChonkyFileActionData) => {
      if (data.id === ChonkyActions.OpenFiles.id) {
        const { targetFile, files } = data.payload;
        const fileToOpen = targetFile ?? files[0];
        if (fileToOpen && FileHelper.isDirectory(fileToOpen)) {
          const newPrefix = `${fileToOpen.id
            .replace(projectId + "/", "")
            .replace(/\/*$/, "")}/`;
          setFolderPrefix(newPrefix);
        }
      } else if (data.id === ChonkyActions.DeleteFiles.id) {
        for (const file of data.state.selectedFilesForAction) {
          deleteS3Object({
            prefix: folderPrefix,
            fileId: file.id,
            projectId: projectId,
          });
        }
      } else if (data.id === ChonkyActions.DownloadFiles.id) {
        for (const file of data.state.selectedFilesForAction) {
          if (file.isDir) {
            toast.error("Cannot download folders");
            continue;
          }
          void handleDownloadFile(file);
        }
      } else if (data.id === ChonkyActions.UploadFiles.id) {
        hiddenFileInputRef.current?.click();
      } else if (data.id === ChonkyActions.CreateFolder.id) {
        const folderName = prompt("Provide the name for your new folder:");
        if (folderName)
          createFolder({
            prefix: folderPrefix,
            folderName: folderName,
            projectId: projectId,
          });
      }
    },
    [createFolder, deleteS3Object, folderPrefix, handleDownloadFile, projectId]
  );

  const fileActions = [
    ChonkyActions.CreateFolder,
    ChonkyActions.UploadFiles,
    ChonkyActions.DownloadFiles,
    ChonkyActions.DeleteFiles,
  ];

  if (!mounted.current) return null;

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
                onChange={(e) => {
                  void handleFileInputChange(e);
                }}
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
