import * as React from "react";
import {
  File,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
  FileVideo,
} from "lucide-react";
import { ContentType } from "@/app/(routes)/private/profile/_components/tester-profile/_components/documents/_constants";

export function DocumentName({ document }: { document: any }) {
  let contentType;

  if (document?.original) {
    contentType = document?.original?.contentType;
  } else {
    contentType = document?.contentType;
  }

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
      case ContentType.MP4:
        return <FileVideo className="text-purple-600" />;
      default:
        return <File className="text-gray-500" />;
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {getIconByContentType(contentType)} {document?.original ? document.getValue("name") : document?.name}
    </div>
  );
}
