import {
  getAvatarFallbackText,
  getFormattedBase64ForSrc,
} from "@/app/_utils/string-formatters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import UploadProfilePicture from "./_components/upload-profile-picture";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import toasterService from "@/app/_services/toaster-service";
import { deleteProfilePictureService, getProfilePictureService } from "@/app/_services/user.service";
import { useSession } from "next-auth/react";

export default function EditProfilePicture({ user }: { user: any }) {
  const { update } = useSession();

  const [userState, setUserState] = useState<any>();
  const [isDeleteProfilePictureOpen, setIsDeleteProfilePictureOpen] =
    useState(false);
  const [isUploadProfilePictureOpen, setIsUploadProfilePictureOpen] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>();

  const refreshProfilePicture = () => {
    update();
    getProfile();
  };

  const getProfile = async () => {
    try {
      const response = await getProfilePictureService();
      if (response) {
        setProfile(response);
      }
    } catch (error) {
      toasterService.error();
    }
  }

  const deleteProfilePicture = async () => {
    try {
      setIsLoading(true);
      const response = await deleteProfilePictureService();

      if (response?.message) {
        toasterService.success(response.message);
        refreshProfilePicture();
        setIsLoading(false);
        setIsDeleteProfilePictureOpen(false);
      }
    } catch (error) {
      toasterService.error();
      setIsLoading(false);
      setIsDeleteProfilePictureOpen(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  useEffect(() => {
    setUserState(user);
  }, [user]);

  return (
    <>
      <UploadProfilePicture
        isOpen={isUploadProfilePictureOpen}
        setIsOpen={setIsUploadProfilePictureOpen}
        refreshProfilePicture={refreshProfilePicture}
      />

      <ConfirmationDialog
        isOpen={isDeleteProfilePictureOpen}
        setIsOpen={setIsDeleteProfilePictureOpen}
        title="Remove profile picture"
        description="Are you sure you want remove your profile picture?"
        isLoading={isLoading}
        successAction={deleteProfilePicture}
        successLabel="Delete"
        successLoadingLabel="Deleting"
        successVariant={"destructive"}
      />

      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={getFormattedBase64ForSrc(profile)}
              alt="@profilePicture"
            />
            <AvatarFallback>
              {getAvatarFallbackText({
                ...userState,
                name: `${userState?.firstName || ""} ${userState?.lastName || ""
                  }`,
              })}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-medium text-sm">Profile picture</span>
            <span className="text-gray-500 text-xs">PNG, JPEG</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => setIsUploadProfilePictureOpen(true)}
          >
            Upload new picture
          </Button>
          <Button
            variant={"secondary"}
            size={"sm"}
            disabled={!userState?.profilePicture}
            onClick={() => setIsDeleteProfilePictureOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>
    </>
  );
}
