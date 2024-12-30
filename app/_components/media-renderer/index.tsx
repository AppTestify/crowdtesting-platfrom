import { ContentType } from "@/app/(routes)/private/profile/_components/tester-profile/_components/documents/_constants";
import { formatAttachmentDate } from "@/app/_constants/date-formatter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import React, { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Download,
  Ellipsis,
  File,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
  Plus,
  Trash,
  XIcon,
} from "lucide-react";
import { IIssueAttachment } from "@/app/_interface/issue";
import { downloadDocument } from "@/app/_utils/common";
import toasterService from "@/app/_services/toaster-service";
import { ConfirmationDialog } from "../confirmation-dialog";
import { deleteIssueAttachmentService } from "@/app/_services/issue-attachment.service";
import { useParams } from "next/navigation";

const getIconByContentType = (type: any) => {
  switch (type) {
    case ContentType.PDF:
      return <FileText className="text-red-500" />;
    case ContentType.PNG:
      return <FileImage className="text-blue-500" />;
    case ContentType.JPEG:
      return <FileImage className="text-blue-500" />;
    case ContentType.JSON:
      return <FileJson className="text-yellow-500" />;
    case ContentType.CSV:
      return <FileSpreadsheet className="text-green-600" />;
    case ContentType.XLSX:
      return <FileSpreadsheet className="text-green-600" />;
    default:
      return <File className="text-gray-500" />;
  }
};

const MediaRenderer = ({
  attachments,
  title,
  refreshAttachments
}: {
  attachments: any[];
  title: string;
  refreshAttachments: () => void;
}) => {
  if (!attachments?.length) return null;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { issueId } = useParams<{ issueId: string }>();
  const [attachmentId, setAttachmentId] = useState<string>('');
  const { projectId } = useParams<{ projectId: string }>();

  const getFile = async (attachment: IIssueAttachment) => {
    try {
      const fileName = attachment.attachment?.name;
      const contentType = attachment.attachment?.contentType;
      const base64 = attachment.base64;
      downloadDocument(contentType, base64, fileName)
    } catch (error) {
      toasterService.error();
      console.log("Error > getFile", error);
    }
  };

  const deleteFile = async (attachment: IIssueAttachment) => {
    setIsDeleteOpen(true)
    setAttachmentId(attachment.attachment.cloudId)
  }

  const deleteAttachment = async () => {
    setIsLoading(true);
    try {
      const response = await deleteIssueAttachmentService(projectId, issueId, attachmentId);
      if (response?.message) {
        refreshAttachments();
        setIsDeleteOpen(false);
        toasterService.success(response.message);
      }
    } catch (error) {
      toasterService.error();
      setIsDeleteOpen(false);
      console.log("Error > deleteAttachment");
    } finally {
      setIsLoading(false);
    }
  };

  const renderMedia = (file: any, index: number) => {
    const { contentType, name, createdAt } = file.attachment;
    const base64Src = `data:${contentType};base64,${file.base64}`;

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isVideoOpen, setIsVideoOpen] = useState<boolean>(false);

    // for image
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    // for video
    const openVideoModal = () => {
      setIsVideoOpen(true);
    };

    const closeVideoModal = () => {
      setIsVideoOpen(false);
    };

    const handleImageOutsideClick = (e: any) => {
      if (e.target.id === "image-modal-overlay") {
        closeModal();
      }
    };

    const handleVideoOutsideClick = (e: any) => {
      if (e.target.id === "video-modal-overlay") {
        closeVideoModal();
      }
    };

    if (
      [ContentType.PNG, ContentType.JPEG, ContentType.JPG].includes(contentType)
    ) {
      return (
        <Card className="h-fit shadow-none rounded-md" key={index}>
          <CardContent className="p-0 group relative">
            <img
              key={index}
              src={base64Src}
              alt={name}
              onClick={openModal}
              className="rounded-t-md max-h-[92px] w-full object-cover cursor-pointer"
            />
            {isOpen && (
              <div
                id="image-modal-overlay"
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                onClick={handleImageOutsideClick}
              >

                <div className="flex justify-center items-center overflow-hidden">
                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white z-10"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                  <img
                    src={base64Src}
                    alt="Gallery Image"
                    className="w-full max-h-[90vh] object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-start py-1 px-2">
            <span className="text-[12px] font-medium" title={name}>
              {name.length > 30 ? `${name.substring(0, 30)}...` : name}
            </span>
            <span className="text-[10px] mt-[1px]">{formatAttachmentDate(createdAt)}</span>
          </CardFooter>
        </Card>

      );
    }

    if (
      [ContentType.MP4, ContentType.OGG, ContentType.WEBM].includes(contentType)
    ) {
      return (
        <Card className="h-fit shadow-none rounded-md" key={index}>
          <CardContent className="p-0">
            <div className="h-[92px] w-[155px] relative bg-gray-100" onClick={openVideoModal}>
              <video
                width={155}
                controls
                className="rounded-t-md cursor-pointer"

              >
                <source src={base64Src} type={contentType} />
                Your browser does not support the video tag.
              </video>
            </div>

            {isVideoOpen && (
              <div id="video-modal-overlay"
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                onClick={handleVideoOutsideClick}>
                <div className="relative w-full max-w-5xl bg-white rounded-lg overflow-hidden">
                  <button
                    onClick={closeVideoModal}
                    className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <XIcon className="w-6 h-6" />
                  </button>

                  <div className="flex justify-center items-center overflow-hidden">
                    <video
                      src={base64Src}
                      controls
                      className="max-w-[90%] max-h-[80vh] object-contain"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-start py-1 px-2 border-t">
            <span className="text-[12px] font-medium" title={name}>
              {name.length > 30 ? `${name.substring(0, 30)}...` : name}
            </span>
            <span className="text-[10px] mt-[1px]">
              {formatAttachmentDate(createdAt)}
            </span>
          </CardFooter>
        </Card>
      );
    }

    return (
      <Card className="h-fit shadow-none rounded-md" key={index}>
        <CardContent className="p-0">
          <div className="h-[92px] w-[155px] bg-gray-100 flex justify-center items-center">
            {getIconByContentType(contentType)}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start py-1 px-2 border-t">
          <span className="text-[12px] font-medium" title={name}>
            {name.length > 20 ? `${name.substring(0, 20)}...` : name}
          </span>
          <span className="text-[10px] mt-[1px]">
            {formatAttachmentDate(createdAt)}
          </span>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div>
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        setIsOpen={setIsDeleteOpen}
        title="Delete attachment"
        description="Are you sure you want delete this attachment?"
        isLoading={isLoading}
        successAction={deleteAttachment}
        successLabel="Delete"
        successLoadingLabel="Deleting"
        successVariant={"destructive"}
      />
      <div className="flex flex-col gap-3 relative pb-2 mt-4">
        <span className="flex items-center gap-2">
          <span className="font-semibold">{title}</span>
          <span className="bg-gray-200 rounded-full px-2 py-1 text-[10px]">{attachments?.length || 0}</span>
        </span>
        <div className="flex gap-4 flex-wrap w-full">{attachments.map((attachment, index) => (
          <div>
            <div
              key={index}
              className="relative group"
            >
              {renderMedia(attachment, index)}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size={'icon'} className="bg-white hover:bg-gray-50 h-7 w-7"
                  onClick={() => getFile(attachment)}>
                  <Download className="h-2 w-2 text-gray-600" />
                </Button>
                <Button size={'icon'} className="bg-white hover:bg-gray-50 h-7 w-7"
                  onClick={() => deleteFile(attachment)}>
                  <Trash className="h-2 w-2  text-gray-600" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div >
    </div >
  );
};

export default MediaRenderer;
