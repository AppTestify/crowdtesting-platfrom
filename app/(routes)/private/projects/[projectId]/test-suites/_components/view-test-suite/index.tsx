import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet"
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ITestSuite } from "@/app/_interface/test-suite";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/app/_constants/date-formatter";

const ViewTestSuite = ({
    testSuite,
    sheetOpen,
    setSheetOpen,
}: {
    testSuite: ITestSuite;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px]">
                <SheetHeader className="mb-4">
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-md">
                            <div className="capitalize">
                                <span className="mr-2">
                                    {testSuite?.customId}:
                                </span>
                                {testSuite?.title}
                            </div>
                            <p className="text-sm mt-1 text-primary">
                                Created by {testSuite?.userId?.firstName} {testSuite?.userId?.lastName} on {formatDate(testSuite?.createdAt || "")}
                            </p>
                        </p>
                    </div>
                </SheetHeader>
                <DropdownMenuSeparator className="border-b" />
                <div className="mt-4">
                    <span className="">Description</span>
                    <div className="px-2 text-sm leading-relaxed text-gray-700"
                        dangerouslySetInnerHTML={{
                            __html: testSuite?.description || ''
                        }}
                    />
                </div>

                <div className="mt-2">
                    Requirements
                    <div className="mt-2 rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Title</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {testSuite?.requirements?.length ? (
                                    testSuite.requirements.map((requirement, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{requirement.customId}</TableCell>
                                            <TableCell>{requirement.title}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center">
                                            No requirements found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default ViewTestSuite;
