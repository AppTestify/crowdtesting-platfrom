import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet"
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ITestCase } from "@/app/_interface/test-case";
import { formatDate } from "@/app/_constants/date-formatter";

const ViewTestCase = ({
    testCase,
    sheetOpen,
    setSheetOpen,
}: {
    testCase: ITestCase;
    sheetOpen: boolean;
    setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {

    return (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px]">
                <SheetHeader className="mb-4">
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-md capitalize">
                            <span className="mr-2">
                                {testCase?.customId}:
                            </span>
                            {testCase?.title}
                            <p className="text-sm mt-1 text-primary">
                                Created by {testCase?.userId?.firstName} {testCase?.userId?.lastName} on {formatDate(testCase?.createdAt || "")}
                            </p>
                        </p>
                    </div>
                </SheetHeader>
                <DropdownMenuSeparator className="border-b" />
                <div className="mt-3">
                    <span>Expecetd result</span>
                    <div className="px-2 text-sm leading-relaxed text-gray-700">
                        {testCase?.expectedResult}
                    </div>
                </div>

                {/* testSuite */}
                <div className="mt-4">
                    Test suite
                    <div className="mt-2 rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Title</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {testCase?.testSuite ? (
                                    <TableRow>
                                        <TableCell>{testCase?.testSuite?.customId}</TableCell>
                                        <TableCell>{testCase?.testSuite?.title}</TableCell>
                                    </TableRow>
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center">
                                            No test suite found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* test suite requirements */}
                <div className="mt-4">
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
                                {testCase?.requirements?.length ? (
                                    testCase.requirements.map((requirement, index) => (
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

export default ViewTestCase;
