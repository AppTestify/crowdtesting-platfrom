import { ContentType } from "@/app/(routes)/private/profile/_components/tester-profile/_components/documents/_constants";
import { formatAttachmentDate } from "@/app/_constants/date-formatter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import {
  File,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

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
}: {
  attachments: any[];
  title: string;
}) => {
  if (!attachments?.length) return null;

  const renderMedia = (file: any, index: number) => {
    const { contentType, name, createdAt } = file.attachment;
    const base64Src = `data:${contentType};base64,${file.base64}`;

    if (
      [ContentType.PNG, ContentType.JPEG, ContentType.JPG].includes(contentType)
    ) {
      return (
        <Card className="h-fit shadow-none rounded-md" key={index}>
          <CardContent className="p-0">
            <div className="h-[92px] w-[155px] relative bg-gray-100">
              <img
                key={index}
                src={base64Src}
                alt={name}
                className="rounded-t-md max-h-[92px] w-full object-cover"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start py-1 px-2">
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

    if (
      [ContentType.MP4, ContentType.OGG, ContentType.WEBM].includes(contentType)
    ) {
      return (
        <Card className="h-fit shadow-none rounded-md" key={index}>
          <CardContent className="p-0">
            <div className="h-[92px] w-[155px] relative bg-gray-100">
              <video key={index} width={155} controls className="rounded-t-md">
                <source src={base64Src} type={contentType} />
                Your browser does not support the video tag.
              </video>
            </div>
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
            {name.length > 30 ? `${name.substring(0, 30)}...` : name}
          </span>
          <span className="text-[10px] mt-[1px]">
            {formatAttachmentDate(createdAt)}
          </span>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-3 relative pb-2">
      <span className="flex items-center gap-2">
      <span className="font-semibold">{title}</span>
      <span className="bg-gray-200 rounded-full px-2 py-1 text-[10px]">{attachments?.length || 0}</span>
      </span>
      <div className="flex gap-4 flex-wrap w-full">{attachments.map(renderMedia)}</div>
    </div>
  );
};

export default MediaRenderer;
