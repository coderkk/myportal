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
  const utils = api.useContext();
  const router = useRouter();
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);
  const hiddenAnchorRef = useRef<HTMLAnchorElement | null>(null);
  const [folderPrefix, setFolderPrefix] = useState<string>("/");
  const mounted = useRef<boolean>(false);
  const projectId = router.query.projectId as string;
  const [projectBucketCreated, setProjectBucketCreated] = useState(false);

  const { chonkyFiles, isFetchS3BucketContentsError } =
    useFetchS3BucketContents({
      prefix: folderPrefix,
      projectId: projectId,
    });

  const { deleteS3Object } = useDeleteS3Object();

  const { getPreSignedURLForDownload } = useGetPreSignedURLForDownload();

  const { getPreSignedURLForUpload } = useGetPreSignedURLForUpload();

  const { createFolder } = useCreateFolder();

  console.log(chonkyFiles);

  useEffect(() => {
    const helper = async () => {
      if (mounted.current) return;
      mounted.current = true;
      setChonkyDefaults({
        iconComponent: ChonkyIconFA,
        disableDragAndDrop: true,
      });
      // check if the folder for project exists
      chonkyFiles?.map((file) => {
        if (file?.name === projectId) {
          return setProjectBucketCreated(true);
        }
      }, []);
      await createFolder({
        prefix: folderPrefix,
        folderName: projectId,
        projectId: projectId,
      });
      setProjectBucketCreated(true);
    };
    void helper();
  }, [chonkyFiles, createFolder, folderPrefix, projectId]);

  const handleDownloadFile = useCallback(
    async (fileData: FileData) => {
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
        .catch((error) => {
          console.error(error);
        });
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
          alert("Duplicate file name. Delete existing file first");
          return;
        }
      });
      await handleUploadFile(files[0]);
      event.target.value = ""; // clear the input
    }
  };

  const handleUploadFile = async (file: File) => {
    setUploadingFile(true);
    const fileId = folderPrefix === "/" ? file.name : folderPrefix + file.name;
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
          void deleteS3Object({
            prefix: folderPrefix,
            fileId: file.id,
            projectId: projectId,
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

  if (!mounted.current || !projectBucketCreated) return null;

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
