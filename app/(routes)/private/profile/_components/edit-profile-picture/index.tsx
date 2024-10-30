import { getAvatarFallbackText } from "@/app/_utils/string-formatters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import React from "react";

export default function EditProfilePicture({ user }: { user: any }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-4 items-center">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={`data:image/png;base64,${user.profilePicture}`}
            alt="Profile picture"
          />
          <AvatarFallback>{getAvatarFallbackText(user)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-medium text-sm">Profile picture</span>
          <span className="text-gray-500 text-xs">PNG, JPEG under 15MB</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant={"outline"} size={"sm"}>
          Upload new picture
        </Button>
        <Button variant={"secondary"} size={"sm"}>
          Delete
        </Button>
      </div>
    </div>
  );
}
