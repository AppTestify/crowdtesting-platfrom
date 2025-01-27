import { useState, useEffect, useMemo } from "react";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Trash, CheckIcon, Loader2, CircleArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import toasterService from "@/app/_services/toaster-service";
import { getAllUsersService } from "@/app/_services/user.service";
import { IUserByAdmin } from "@/app/_interface/user";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { addMailService } from "@/app/_services/mail.service";
import { IMail } from "@/app/_interface/mail";
import { format } from "date-fns";
import TextEditor from "@/app/(routes)/private/projects/_components/text-editor";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarFallbackText } from "@/app/_utils/string-formatters";

const mailSchema = z.object({
    emails: z.array(z.string()).min(1, "At least one user is required").max(20, "Maximum 20 users allowed"),
    subject: z.string().min(1, "Required"),
    body: z.string().min(1, "Required"),
});

export function MailDisplay({ refreshMails, mails }: { refreshMails: () => void, mails: IMail[] }) {
    const form = useForm<z.infer<typeof mailSchema>>({
        resolver: zodResolver(mailSchema),
        defaultValues: {
            emails: [],
            subject: "",
            body: "",
        },
    });

    const [users, setUsers] = useState<IUserByAdmin[]>([]);
    const [searchString, setSearchString] = useState<string>("");
    const userData = form.watch("emails");
    const [itemsPerRow, setItemsPerRow] = useState<number>(3);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [activeMail, setActiveMail] = useState<boolean>(false);
    const [mail, setMail] = useState<IMail>();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 640) {
                setItemsPerRow(1);
            } else if (window.innerWidth <= 1024) {
                setItemsPerRow(2);
            } else {
                setItemsPerRow(3);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const inputHeight = Math.max(40, 30 + Math.ceil(userData?.length / itemsPerRow) * 30);
    const defaultUsers = useMemo(() => users.map((user) => user.email), [users]);

    const shouldShowAddButton = useMemo(() => {
        return searchString && !defaultUsers.includes(searchString);
    }, [searchString, defaultUsers]);

    const addCustomUser = () => {
        if (!searchString) return;
        form.setValue("emails", [...userData, searchString]);
        setSearchString("");
    };

    const handleSelectUser = (user: string) => {
        if (!userData.includes(user)) {
            form.setValue("emails", [...userData, user]);
        }
        form.clearErrors('emails');

    };

    const handleRemoveUser = (index: number) => {
        form.setValue(
            "emails",
            userData.filter((_, idx) => idx !== index)
        );
    };

    const validateMail = () => {
        if (form.formState.isValid) {
            form.handleSubmit(onSubmit)();
        }
    };

    const reset = () => {
        form.reset();
    }

    const onSubmit = async (data: z.infer<typeof mailSchema>) => {
        setIsLoading(true);
        try {
            const response = await addMailService(data);
            if (response) {
                toasterService.success(response.message);
                refreshMails();
                reset();
            }
        } catch (error) {
            toasterService.error();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userData?.length <= 20) {
            form.clearErrors('emails');
        }
    }, [userData]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUsersService();
                setUsers(response);
            } catch (error) {
                toasterService.error();
            }
        };

        fetchUsers();
    }, []);

    const updateActiveMailFromLocalStorage = () => {
        const storedActiveMail = localStorage.getItem('activeMail');
        setActiveMail(storedActiveMail === 'true');
    };

    useEffect(() => {
        updateActiveMailFromLocalStorage();
        const handleStorageChange = () => {
            updateActiveMailFromLocalStorage();
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const updateSelectedMailFromLocalStorage = () => {
        const storedSelectedMailId = localStorage.getItem("selecetdMailId");

        if (storedSelectedMailId) {
            if (mails && mails.length > 0) {
                const foundMail = mails.find(mail => mail.id === storedSelectedMailId);
                if (foundMail) {
                    setMail(foundMail);
                }
            }
        }
    };

    if (typeof window !== "undefined") {
        const originalSetItemData = localStorage.setItem;
        localStorage.setItem = function (key, value) {
            originalSetItemData.apply(localStorage, arguments as unknown as [string, string]);
            if (key === 'selecetdMailId') {
                updateSelectedMailFromLocalStorage();
            }
        };
    }

    useEffect(() => {
        updateSelectedMailFromLocalStorage();
        const handleStorageChange = () => {
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        if (mails && mails.length > 0) {
            updateSelectedMailFromLocalStorage();
        }
    }, [mails]);


    if (typeof window !== "undefined") {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function (key, value) {
            originalSetItem.apply(localStorage, arguments as unknown as [string, string]);
            if (key === 'activeMail') {
                updateActiveMailFromLocalStorage();
            }
        };
    }

    return (
        <div className="flex h-full flex-col w-full ">
            {activeMail ? (
                <div className="ml-auto mr-6 my-[6px]">
                    <Button
                        variant={"outline"}
                        size={"sm"}
                        onClick={() => {
                            setActiveMail(false)
                            localStorage.setItem("selecetdMailId", "");
                        }}
                        className="flex items-center gap-2"
                    >
                        <span className="text-xs flex">
                            <CircleArrowLeft />
                            <span className="ml-2">Back</span>
                        </span>
                    </Button>
                </div>
            ) : (
                <div className="mt-[44px]" />
            )}
            <Separator className="" />
            {!activeMail ?
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
                        <div className="mt-4 mx-2">
                            <FormItem className="flex flex-col gap-2 !mt-[2px]">
                                <FormLabel>Users</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                'justify-start items-start p-2 flex-wrap gap-2',
                                                !searchString && 'text-muted-foreground'
                                            )}
                                            style={{
                                                height: `${inputHeight}px`,
                                                minHeight: '40px',
                                                maxHeight: '150px',
                                                overflowY: 'auto',
                                            }}
                                        >
                                            {/* User Tags */}
                                            <div className="flex flex-wrap gap-2 overflow-hidden max-w-full">
                                                {userData?.map((user, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2 bg-gray-200 px-2 py-1 rounded-full"
                                                    >
                                                        <span className="text-xs text-black">{user}</span>
                                                        <div className="p-1 cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveUser(index)
                                                            }}>
                                                            <Trash size={8} className="text-destructive" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {userData?.length === 0 && <span className="text-start">Select Users</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0 w-full" side="bottom" align="start" sideOffset={4}>
                                        <Command>
                                            <CommandInput
                                                placeholder="Search users"
                                                className="h-9"
                                                value={searchString}
                                                onValueChange={(value: string) => setSearchString(value)}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    <span className="text-sm">No user found</span>
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {shouldShowAddButton && (
                                                        <CommandItem value={searchString} onSelect={addCustomUser}>
                                                            {searchString}
                                                        </CommandItem>
                                                    )}
                                                    {defaultUsers
                                                        .filter((user) =>
                                                            user.toLowerCase().includes(searchString.toLowerCase())
                                                        )
                                                        .map((user) => (
                                                            <CommandItem
                                                                key={user}
                                                                value={user}
                                                                onSelect={() => handleSelectUser(user)}
                                                            >
                                                                {user}
                                                                <CheckIcon
                                                                    className={cn(
                                                                        "ml-auto h-4 w-4",
                                                                        userData?.includes(user) ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                            </CommandItem>
                                                        ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {form.formState.errors.emails && (
                                    <span className="text-red-500 text-sm">{form.formState.errors.emails.message}</span>
                                )}
                                {/* <FormMessage /> */}
                            </FormItem>
                        </div>

                        <div className="grid grid-cols-1 gap-2 mt-4 mx-2">
                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-2 mt-4 mx-2">
                            <FormField
                                control={form.control}
                                name="body"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Body</FormLabel>
                                        <FormControl>
                                            <TextEditor
                                                markup={field.value || ""}
                                                onChange={(value) => {
                                                    form.setValue("body", value);
                                                    form.trigger("body");
                                                }} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="mt-4 flex justify-end mx-2 mb-2">
                            <Button type="submit" disabled={isLoading} onClick={validateMail}>
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                {isLoading ? "Sending Mail" : "Send Mail"}
                            </Button>
                        </div>
                    </form>
                </Form>
                :
                <div className="flex flex-1 flex-col">
                    <div className="flex items-start p-4">
                        <div className="flex items-start gap-4 text-sm">
                            <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                                <AvatarFallback>
                                    {getAvatarFallbackText({
                                        ...mail,
                                        name: `${mail?.userId?.firstName || ""} ${mail?.userId?.lastName || ""}`,
                                        email: mail?.userId?.email || ""
                                    })}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1">
                                <div className="font-semibold">{mail?.userId?.firstName || ""} {mail?.userId?.lastName || ""}</div>
                                <div className="line-clamp-1 text-xs">{mail?.subject}</div>
                            </div>
                        </div>
                        {mail?.createdAt && (
                            <div className="ml-auto text-xs text-muted-foreground">
                                {format(mail?.createdAt, "PPpp")}
                            </div>
                        )}
                    </div>
                    <Separator />
                    <div
                        className="flex-1 whitespace-pre-wrap p-4 text-sm"
                        dangerouslySetInnerHTML={{
                            __html: mail?.body || "",
                        }}
                    />
                </div>
            }
        </div>
    );
}
