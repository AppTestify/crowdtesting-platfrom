import * as React from "react";
import { IDocument } from "@/app/_interface/document";
import { Row } from "@tanstack/react-table";
import {
  File,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import {
  ContentType,
  DocumentType,
} from "@/app/(routes)/private/profile/_components/tester-profile/_components/documents/_constants";
import { Badge } from "@/components/ui/badge";

export function FileType({ document }: { document: Row<IDocument> }) {
  const getFileType = (fileType: any) => {
    switch (fileType) {
      case DocumentType.NDA:
        return <Badge variant={"destructive"}>{fileType}</Badge>;
      case DocumentType.IDENTITY_PROOF:
        return <Badge>{fileType}</Badge>;
      default:
        return <Badge variant={"secondary"}>{fileType}</Badge>;
    }
  };

  return <div>{getFileType(document.getValue("fileType"))}</div>;
}
