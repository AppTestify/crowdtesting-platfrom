import * as React from "react";
import { IDocument, IUserDocument } from "@/app/_interface/document";
import { Row } from "@tanstack/react-table";
import {
  File,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { ContentType } from "@/app/(routes)/private/profile/_components/tester-profile/_components/documents/_constants";
import { IIssueAttachmentDisplay } from "@/app/_interface/issue";

export function DocumentName({ document }: { document: Row<IDocument | IIssueAttachmentDisplay | IUserDocument> }) {
  const contentType = document.getValue("contentType");

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

  return (
    <div className="flex gap-2 items-center">
      {getIconByContentType(contentType)} {document.getValue("name")}
    </div>
  );
}
