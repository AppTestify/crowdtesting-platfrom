import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { IUserByAdmin } from "@/app/_interface/user";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { getUserService } from "@/app/_services/user.service";
import toasterService from "@/app/_services/toaster-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarFallbackText, getFormattedBase64ForSrc } from "@/app/_utils/string-formatters";
import { Badge } from "@/components/ui/badge";
import { Copy, MapPin } from "lucide-react";
import UserCertificates from "../certificates";
import { ICertificatesView } from "@/app/_interface/tester";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { showUsersRoleInBadges } from "@/app/_utils/common-functionality";
import { formatDistanceToNow } from "date-fns";
import { UserRoles } from "@/app/_constants/user-roles";
import Documents from "../../../profile/_components/tester-profile/_components/documents";

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
    const [isPaypalVisible, setIsPaypalVisible] = useState<boolean>(false);
    const [open, setOpen] = useState(false);
    const userId = user?.id as string;

    const getUser = async () => {
        try {
            setIsViewLoading(true);
            const users = await getUserService(userId);
            if (users) {
                setUserData(users);
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsViewLoading(false);
        }
    };

    useEffect(() => {
        if (sheetOpen && userId) {
            getUser();
        }
    }, [sheetOpen, userId]);

    const copyEmail = (email: string) => {
        navigator.clipboard.writeText(email)
            .then(() => {
                setOpen(true);
                setTimeout(() => setOpen(false), 1500);
            })
            .catch((err) => {
                console.error("Failed to copy email: ", err);
            });
    };

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>

            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px]">
                <SheetHeader>
                    <SheetTitle className="text-left">Tester View</SheetTitle>
                    <DropdownMenuSeparator className="border-b" />
                </SheetHeader>
                {isViewLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <p className="text-gray-500">Loading...</p>
                    </div>
                ) : (
                    <>
                        <SheetTitle>
                            <div className="flex items-center space-x-2 p-2">
                                <Avatar className="h-16 w-16 rounded-full overflow-hidden">
                                    <AvatarImage
                                        src={getFormattedBase64ForSrc(userData?.profilePicture)}
                                        alt="Profile Picture"
                                        className="h-full w-full object-cover"
                                    />
                                    <AvatarFallback>
                                        {getAvatarFallbackText({
                                            ...userData,
                                            name: `${userData?.firstName || ""} ${userData?.lastName || ""}`,
                                            email: userData?.email || ""
                                        })}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col space-y-1">
                                    <div className="font-semibold text-gray-800 text-md truncate">
                                        {userData?.firstName || "User"} {userData?.lastName || "Name"}
                                    </div>
                                    <TooltipProvider>
                                        <div className="flex text-gray-500 text-sm truncate">
                                            <span className="truncate">{userData?.email}</span>
                                            <Tooltip open={open}>
                                                <TooltipTrigger asChild>
                                                    <span
                                                        className="ml-2 flex-shrink-0 cursor-pointer"
                                                        onClick={() => copyEmail(userData?.email as string)}
                                                    >
                                                        <Copy className="w-4" />
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    Copied!
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="text-end text-gray-500 text-sm">
                                        {showUsersRoleInBadges(userData?.role as UserRoles)}
                                    </div>
                                    <div className="text-end text-xs text-gray-500">
                                        {
                                            userData?.createdAt ?
                                                formatDistanceToNow(new Date(userData?.createdAt), { addSuffix: true }) :
                                                "Date not available"
                                        }
                                    </div>
                                </div>
                            </div>
                        </SheetTitle>
                        <DropdownMenuSeparator className="border-b" />

                        <Tabs defaultValue="overview" className="w-full my-3">
                            <TabsList className="grid w-fit grid-cols-3">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                                <TabsTrigger value="payments">Payments</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overview">
                                {/* Skills */}
                                <div>
                                    <div className="flex mt-2">
                                        <p className="font-semibold">Skills</p>
                                    </div>
                                    {userData?.tester?.bio ?
                                        <div>
                                            {userData?.tester?.skills.map((skill) => (
                                                <Badge className="px-2 py-1 mx-2 my-1">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                        :
                                        <div className="text-center">No skills found</div>
                                    }
                                </div>
                                {/* Address */}
                                <div className="mt-2 ">
                                    <div>
                                        <p className="font-semibold text-lg">Address</p>
                                    </div>
                                    {userData?.tester?.address ?
                                        <div className="flex items-start space-x-2 mx-2 my-1">
                                            <MapPin className="text-gray-500 w-5 flex items-center" />
                                            <div>
                                                <p className="text-sm text-gray-800">{userData?.tester?.address.street}</p>
                                                <p className="text-sm text-gray-800">{userData?.tester?.address.city}, {userData?.tester?.address.postalCode}</p>
                                                <p className="text-sm text-gray-800">{userData?.tester?.address.country}</p>
                                            </div>
                                        </div>
                                        :
                                        <div className="text-center">No address found</div>
                                    }
                                </div>
                                {/* User Bio */}
                                <div>
                                    <p className="font-semibold text-lg">Bio</p>
                                    {userData?.tester?.bio ?
                                        <p className="mb-2">
                                            {userData?.tester?.bio}
                                        </p>
                                        : <p className="text-center">No user bio found</p>
                                    }
                                    <div>

                                    </div>
                                </div>
                                {/* Certificate */}
                                <div>
                                    <div>
                                        <p className="font-semibold text-lg">Certificates</p>
                                        <UserCertificates certificate={userData?.tester?.certifications as ICertificatesView[] | []} />
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="documents">
                                {/* <UserDocuments documents={Array.isArray(userData?.file) ? (userData.file as IUserDocument[]) : []} /> */}
                                <Documents userId={userData?._id} />
                            </TabsContent>
                            <TabsContent value="payments">
                                {userData?.paypalId ?
                                    <div className="p-3">
                                        <Label className="block mb-1">Paypal ID:</Label>
                                        <Input
                                            type={isPaypalVisible ? 'text' : 'password'}
                                            disabled
                                            value={userData?.paypalId || ""}
                                            className={`border `}
                                        />
                                        <div className="flex items-center mt-2">
                                            <Checkbox
                                                id="terms"
                                                className="h-5 w-5 text-blue-500 border-gray-300"
                                                checked={isPaypalVisible}
                                                onCheckedChange={() => setIsPaypalVisible(!isPaypalVisible)}
                                            />
                                            <Label htmlFor="terms" className="ml-2 text-gray-600">
                                                Show Paypal ID
                                            </Label>
                                        </div>
                                    </div>
                                    : <div className="p-2">No Paypal ID found</div>
                                }
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </SheetContent>
        </Sheet >
    )
}

export default ViewTesterIssue;
