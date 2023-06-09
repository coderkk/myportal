<Switch
      checked={enabled}
      onChange={setEnabled}
      className={classNames(
        enabled ? 'bg-indigo-600' : 'bg-gray-200',
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2'
      )}
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={classNames(
          enabled ? 'translate-x-5' : 'translate-x-0',
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
        )}
      />
    </Switch>import type { ChonkyFileActionData, FileArray, FileData } from "chonky";
import {
  ChonkyActions,
  FileContextMenu,
  FileHelper,
  FileList,
  FileNavbar,
  FileToolbar,
  FileBrowser as _FileBrowser,
  setChonkyDefaults,
} from "chonky";
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import path from "path";
import { useCallback, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { env } from "../../env/client.mjs";
import {
  useCreateFolder,
  useDeleteS3Object,
  useFetchS3BucketContents,
  useGetPreSignedURLForDownload,
  useGetPreSignedURLForUpload,
} from "../../hooks/s3";
import { api } from "../../utils/api";

const FileBrowser = ({ projectId }: { projectId: string }) => {
  const utils = api.useContext();
  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);
  const hiddenAnchorRef = useRef<HTMLAnchorElement | null>(null);
  const [folderPrefix, setFolderPrefix] = useState<string>("/");
  const { files: chonkyFiles } = useFetchS3BucketContents({
    prefix: folderPrefix,
    projectId: projectId,
    aws_s3_bucket_name: env.NEXT_PUBLIC_AWS_S3_FILE_MANAGER_BUCKET_NAME,
  });

  const { deleteS3Object } = useDeleteS3Object();

  const { getPreSignedURLForDownload } = useGetPreSignedURLForDownload();

  const { getPreSignedURLForUpload } = useGetPreSignedURLForUpload();

  const { createFolder } = useCreateFolder();

  setChonkyDefaults({
    iconComponent: ChonkyIconFA,
    disableDragAndDrop: true,
  });

  const handleDownloadFile = useCallback(
    async (fileData: FileData) => {
      try {
        const { preSignedURLForDownload } = await getPreSignedURLForDownload({
          fileId: fileData.id,
          projectId: projectId,
          aws_s3_bucket_name: env.NEXT_PUBLIC_AWS_S3_FILE_MANAGER_BUCKET_NAME,
        });
        const res = await fetch(preSignedURLForDownload, {
          method: "GET",
        });
        const url = window.URL.createObjectURL(new Blob([await res.blob()]));
        if (hiddenAnchorRef.current) {
          hiddenAnchorRef.current.href = url;
          hiddenAnchorRef.current.download = fileData.name;
          hiddenAnchorRef.current.click();
        }
      } catch (error) {
        toast.error("Error when downloading file");
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
      const fileSize = files[0].size / 1024 / 1024; // MB
      if (fileSize > 5) return toast.error("File size exceeds 5MB.");
      const fileName = files[0].name;
      // if exists, don't upload
      if (chonkyFiles)
        for (const file of chonkyFiles) {
          if (file?.name == fileName) {
            toast.error("Duplicate file name. Delete existing file first");
            return;
          }
        }
      await handleUploadFile(files[0]);
      event.target.value = ""; // clear the input
    }
  };

  const handleUploadFile = useCallback(
    async (file: File) => {
      const fileId =
        folderPrefix === "/" ? file.name : folderPrefix + file.name;
      try {
        const { preSignedURLForUpload } = await getPreSignedURLForUpload({
          fileId: fileId,
          projectId: projectId,
          aws_s3_bucket_name: env.NEXT_PUBLIC_AWS_S3_FILE_MANAGER_BUCKET_NAME,
        });

        const uploadFile = fetch(preSignedURLForUpload, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        })
          .catch(() => {
            throw new Error();
          })
          .finally(() => {
            void utils.s3.fetchS3BucketContents.invalidate({
              prefix: folderPrefix,
              projectId: projectId,
              aws_s3_bucket_name:
                env.NEXT_PUBLIC_AWS_S3_FILE_MANAGER_BUCKET_NAME,
            });
          });

        await toast.promise(uploadFile, {
          loading: "Uploading file",
          success: "File uploaded successfully",
          error: "Error when uploading file",
        });
      } catch (error) {
        // This try catch is necessary as getPreSignedURLForDownload
        // returns a promise that can possibly cause a runtime error.
        // we handle this error in src/utils/api.ts so there's no need
        // to do anything here other than catch the error.
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
            aws_s3_bucket_name: env.NEXT_PUBLIC_AWS_S3_FILE_MANAGER_BUCKET_NAME,
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
            aws_s3_bucket_name: env.NEXT_PUBLIC_AWS_S3_FILE_MANAGER_BUCKET_NAME,
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
  return (
    <_FileBrowser
      files={chonkyFiles ? chonkyFiles : Array.from({ length: 3 }, () => null)}
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
    </_FileBrowser>
  );
};

export default FileBrowser;
