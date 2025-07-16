import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { IUserByAdmin } from "@/app/_interface/user";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { getUserService } from "@/app/_services/user.service";
import toasterService from "@/app/_services/toaster-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarFallbackText, getFormattedBase64ForSrc } from "@/app/_utils/string-formatters";
import { Badge } from "@/components/ui/badge";
import { Copy, MapPin, User, Eye } from "lucide-react";
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
import { getDevicesByUserService } from "@/app/_services/device.service";
import { IDevice } from "@/app/_interface/device";
import ViewUserDevice from "../view-device";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    const [loginUser, setUser] = useState<any>();
    const [devices, setDevices] = useState<IDevice[]>([]);
    const [isPaypalVisible, setIsPaypalVisible] = useState<boolean>(false);
    const [open, setOpen] = useState(false);
    const userId = user?.id || user?._id as string;
    const { data } = useSession();

    useEffect(() => {
        if (data) {
            const { user } = data;
            setUser(user);
        }
    }, [data]);

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

    const getDevices = async () => {
        const devices = await getDevicesByUserService(userId);
        setDevices(devices);
    };

    useEffect(() => {
        if (sheetOpen && userId) {
            getDevices();
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
        <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Eye className="h-5 w-5 text-blue-600" />
                        </div>
                        User Profile
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        View detailed information about {userData?.firstName || "the user"}.
                    </DialogDescription>
                </DialogHeader>

                {isViewLoading ? (
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <Skeleton className="h-16 w-16 rounded-full bg-gray-200" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-[400px] bg-gray-200" />
                                        <Skeleton className="h-4 w-[350px] bg-gray-200" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <Skeleton className="h-8 w-[390px] bg-gray-200" />
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* User Header Card */}
                        <Card className="border-l-4 border-l-blue-500">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Basic Information
                                </CardTitle>
                                <CardDescription>
                                    User's personal details and contact information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
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
                                    <div className="flex flex-col space-y-2 flex-1">
                                        <div className="font-semibold text-gray-800 text-lg">
                                            {userData?.firstName || "User"} {userData?.lastName || "Name"}
                                        </div>
                                        <TooltipProvider>
                                            <div className="flex items-center text-gray-500 text-sm">
                                                <span className="truncate">{userData?.email}</span>
                                                <Tooltip open={open}>
                                                    <TooltipTrigger asChild>
                                                        <span
                                                            className="ml-2 flex-shrink-0 cursor-pointer hover:text-blue-600 transition-colors"
                                                            onClick={() => copyEmail(userData?.email as string)}
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">
                                                        Copied!
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TooltipProvider>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <div className="text-end">
                                            {showUsersRoleInBadges(userData?.role as UserRoles)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {
                                                userData?.createdAt ?
                                                    formatDistanceToNow(new Date(userData?.createdAt), { addSuffix: true }) :
                                                    "Date not available"
                                            }
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tabs Section */}
                        <Card>
                            <CardContent className="p-6">
                                <Tabs defaultValue="overview" className="w-full">
                                    <TabsList className="grid w-fit grid-cols-4 mb-6">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="documents">Documents</TabsTrigger>
                                        <TabsTrigger value="devices">Devices</TabsTrigger>
                                        <TabsTrigger value="payments">Payments</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="overview" className="space-y-6">
                                        {/* Skills */}
                                        <div>
                                            {userData?.tester?.skills && userData?.tester?.skills.length > 0 ? (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {userData?.tester?.skills.map((skill, index) => (
                                                            <Badge key={index} className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
                                                    <p className="text-sm text-gray-500">No skills added</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Address */}
                                        <div>
                                            {userData?.tester?.address ? (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-3">Address</h3>
                                                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                                        <MapPin className="text-gray-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-gray-800 font-medium">{userData?.tester?.address.street}</p>
                                                            <p className="text-sm text-gray-600">{userData?.tester?.address.city}, {userData?.tester?.address.postalCode}</p>
                                                            <p className="text-sm text-gray-600">{userData?.tester?.address.country}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                                                    <p className="text-sm text-gray-500">No address added</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* User Bio */}
                                        <div>
                                            {userData?.tester?.bio ? (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-3">Bio</h3>
                                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                        {userData?.tester?.bio}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 mb-2">Bio</h3>
                                                    <p className="text-sm text-gray-500">No user bio added</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Certificates */}
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-3">Certificates</h3>
                                            <UserCertificates certificate={userData?.tester?.certifications as ICertificatesView[] | []} />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="documents">
                                        <Documents userId={userData?._id} />
                                    </TabsContent>

                                    <TabsContent value="devices">
                                        <ViewUserDevice device={devices} />
                                    </TabsContent>

                                    <TabsContent value="payments">
                                        {userData?.paypalId ? (
                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-gray-900">Payment Information</h3>
                                                <div className="space-y-3">
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-700">Paypal ID/UPI ID:</Label>
                                                        <Input
                                                            type={isPaypalVisible ? 'text' : 'password'}
                                                            disabled
                                                            value={userData?.paypalId || ""}
                                                            className="mt-1 border-gray-300 bg-gray-50"
                                                        />
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="showPaypal"
                                                            className="h-4 w-4 text-blue-500 border-gray-300"
                                                            checked={isPaypalVisible}
                                                            onCheckedChange={() => setIsPaypalVisible(!isPaypalVisible)}
                                                        />
                                                        <Label htmlFor="showPaypal" className="text-sm text-gray-600">
                                                            Show Paypal ID/UPI ID
                                                        </Label>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-2">Payment Information</h3>
                                                <p className="text-sm text-gray-500">No Paypal ID found</p>
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default ViewTesterIssue;
