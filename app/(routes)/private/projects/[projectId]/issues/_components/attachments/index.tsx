import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";

export default function IssueAttachments() {
  return (
    <div className="mt-4">
      <div className="flex w-full items-center gap-2">
        <div className="w-full">
          <Label htmlFor="attachments">Attachments</Label>
          <Input className="mt-2" id="attachments" type="file" multiple/>
        </div>
        <div className="flex flex-col">
          <Label htmlFor="attachments" className="invisible">
            Upload
          </Label>
          <Button className="mt-4">Upload</Button>
        </div>
      </div>
    </div>
  );
}
