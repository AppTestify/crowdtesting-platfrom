import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ITestSuite } from "@/app/_interface/test-suite";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/app/_constants/date-formatter";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TestSuiteTabs } from "@/app/_constants/project";

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
      <SheetContent className="w-full !max-w-full md:w-[580px] md:!max-w-[580px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex justify-between items-center mt-4">
            <p className="text-xl font-medium capitalize">
              <span className="mr-2 text-primary">{testSuite?.customId}:</span>
              {testSuite?.title}
            </p>
          </div>
          <span className="text-mute text-sm">
            {testSuite?.userId?.firstName ? (
              <span>
                Created by {testSuite?.userId?.firstName}{" "}
                {testSuite?.userId?.lastName}
                {", "}
              </span>
            ) : null}
            Created on {formatDate(testSuite?.createdAt || "")}
          </span>
        </SheetHeader>

        <Tabs defaultValue={TestSuiteTabs.DESCRIPTION} className="w-full mt-4">
          <TabsList className="grid grid-cols-2 mb-4 w-full md:w-fit">
            <TabsTrigger
              value={TestSuiteTabs.DESCRIPTION}
              className="flex items-center"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value={TestSuiteTabs.REQUIREMENTS}
              className="flex items-center"
            >
              Requirements
            </TabsTrigger>
          </TabsList>
          <TabsContent value={TestSuiteTabs.DESCRIPTION} className="w-full">
            <div className="mt-4">
              <div
                className="px-2 text-sm leading-relaxed text-gray-700 rich-description"
                dangerouslySetInnerHTML={{
                  __html: testSuite?.description || "",
                }}
              />
            </div>
          </TabsContent>
          <TabsContent value={TestSuiteTabs.REQUIREMENTS} className="w-full">
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
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default ViewTestSuite;
