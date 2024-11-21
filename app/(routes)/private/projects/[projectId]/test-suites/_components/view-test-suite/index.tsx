import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet"
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ITestSuite } from "@/app/_interface/test-suite";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

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
                        <p className="text-md capitalize">{testSuite?.title}</p>
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
                            <TableBody>
                                {testSuite?.requirements?.length ? (
                                    testSuite?.requirements?.map((requirement, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{requirement.title}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <div className="h-10 text-center">No requirements found</div>
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
