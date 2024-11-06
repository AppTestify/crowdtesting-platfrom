import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { IUserByAdmin } from "@/app/_interface/user";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { getUserService } from "@/app/_services/user.service";
import toasterService from "@/app/_services/toaster-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarFallbackText, getFormattedBase64ForSrc } from "@/app/_utils/string-formatters";

const ViewTesterIssue = ({
    user,
    sheetOpen,
    setSheetOpen,
}: {
    user: IUserByAdmin;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const [isViewLoading, setIsViewLoading] = useState<boolean>(false);
    const [userData, setUserData] = useState<IUserByAdmin>();
    const userId = user?.id as string;

    const getUser = async () => {
        try {
            setIsViewLoading(true);
            const users = await getUserService(userId);
            if (users) {
                setUserData(users);
            }
            console.log("userData", userData);
        } catch (error) {
            toasterService.error();
        } finally {
            setIsViewLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            getUser();
        }
    }, [userId]);

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px]">
                <SheetHeader>
                    <SheetTitle className="text-left">Profile Overview</SheetTitle>
                    <DropdownMenuSeparator className="border-b" />
                    <SheetTitle>
                        <Avatar className="h-20 w-20">
                            <AvatarImage
                                src={getFormattedBase64ForSrc(userData?.profilePicture)}
                                alt="@profilePicture"
                            />
                            <AvatarFallback>
                                {getAvatarFallbackText({
                                    ...userData,
                                    name: `${userData?.firstName || ""} ${userData?.lastName || ""
                                        }`,
                                })}
                            </AvatarFallback>
                        </Avatar>
                    </SheetTitle>
                    <DropdownMenuSeparator className="border-b" />
                </SheetHeader>

                <Tabs defaultValue="summary" className="w-full my-3">
                    <TabsList className="grid w-fit grid-cols-2">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="attachments">Attachments</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary">
                        <div>
                            <div className="flex mt-4">
                                {/* <p>Severity: {issue?.severity}</p>
                                <p className="ml-8">Status: {statusBadge(issue?.status)}</p> */}
                            </div>
                            {/* <div className="mt-4"
                                dangerouslySetInnerHTML={{
                                    __html: issueData?.description || '',
                                }}
                            /> */}
                        </div>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}

export default ViewTesterIssue;
