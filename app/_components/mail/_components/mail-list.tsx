import { cn } from "@/lib/utils"
import { useMail } from "../use-mail"
import { formatDistanceToNow } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { IMail } from "@/app/_interface/mail"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"

export function MailList({ items, isLoading }: { items: IMail[], isLoading: boolean }) {
    const [mail, setMail] = useMail()
    const [activeMail, setActiveMail] = useState<boolean>(false);

    useEffect(() => {
        const isActive = items.some((item) => mail.selected === item.id);
        setActiveMail((prev) => {
            const newActiveMail = isActive;
            localStorage.setItem('activeMail', newActiveMail ? "true" : "false");
            localStorage.setItem("selecetdMailId", mail?.selected as string);
            return newActiveMail;
        });
    }, [mail.selected, items]);

    const updateSelectedMailFromLocalStorage = () => {
        const storedSelectedMailId = localStorage.getItem("selecetdMailId");
        if (!storedSelectedMailId) {
            setMail({ selected: null });
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
            updateSelectedMailFromLocalStorage();
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    return (
        <ScrollArea className="h-screen">
            {!isLoading ? (
                <div className="flex flex-col gap-2 p-4 pt-0">
                    {items.map((item) => (
                        <button
                            key={item.id}
                            className={cn(
                                "w-full flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                                mail.selected === item.id && "bg-muted"
                            )}
                            onClick={() =>
                                setMail({
                                    ...mail,
                                    selected: item.id,
                                })
                            }
                        >
                            <div className="flex w-full flex-col gap-1">
                                <div className="flex items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold">{item?.userId?.firstName || ""} {item?.userId?.lastName || ""}</div>
                                    </div>
                                    <div
                                        className={cn(
                                            "ml-auto text-xs",
                                            mail.selected === item.id
                                                ? "text-foreground"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {formatDistanceToNow(item.createdAt, {
                                            addSuffix: true,
                                        })}
                                    </div>
                                </div>
                                <div className="text-xs font-medium">{item.subject}</div>
                            </div>
                            <div
                                className="line-clamp-2 text-xs text-muted-foreground"
                                dangerouslySetInnerHTML={{
                                    __html: item.body?.substring(0, 300) || "",
                                }}
                            />
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-3 items-center">
                    <Skeleton className="h-[100px] w-[93%] bg-gray-200 rounded-xl md:h-[80px] lg:h-[100px]" />
                    <Skeleton className="h-[100px] w-[93%] bg-gray-200 rounded-xl md:h-[80px] lg:h-[100px]" />
                    <Skeleton className="h-[100px] w-[93%] bg-gray-200 rounded-xl md:h-[80px] lg:h-[100px]" />
                    <Skeleton className="h-[100px] w-[93%] bg-gray-200 rounded-xl md:h-[80px] lg:h-[100px]" />
                    <Skeleton className="h-[100px] w-[93%] bg-gray-200 rounded-xl md:h-[80px] lg:h-[100px]" />
                </div>


            )}
        </ScrollArea>
    )
}
