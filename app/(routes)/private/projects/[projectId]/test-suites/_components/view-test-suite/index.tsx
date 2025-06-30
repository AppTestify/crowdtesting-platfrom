import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import ViewRequirement from "../../../requirements/_components/view-requirement";
import { useState } from "react";
import { IRequirement } from "@/app/_interface/requirement";

// Helper function to strip HTML tags from text
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, '');
};

const ViewTestSuite = ({
  testSuite,
  sheetOpen,
  setSheetOpen,
  isView
}: {
  testSuite: ITestSuite;
  sheetOpen: boolean;
  setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isView?: boolean;
}) => {
  const [isRequirementViewOpen, setIsRequirementViewOpen] = useState<boolean>(false);
  const [requirement, setRequirement] = useState<IRequirement>();

  const getRequirement = (requirement: IRequirement) => {
    setRequirement(requirement);
    setIsRequirementViewOpen(true);
  }

  return (
    <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
      <ViewRequirement
        requirement={requirement as IRequirement}
        sheetOpen={isRequirementViewOpen}
        setSheetOpen={setIsRequirementViewOpen}
      />
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-left">
            Test Suite Details
          </DialogTitle>
          <div className="flex justify-between items-center mt-4">
            <p className="text-xl font-medium capitalize">
              <span className="mr-2 text-primary">{testSuite?.customId}:</span>
              {stripHtmlTags(testSuite?.title || "")}
            </p>
          </div>
          <span className="text-mute text-sm">
            {testSuite?.userId?.firstName ? (
              <span>
                Created by {stripHtmlTags(testSuite?.userId?.firstName || "")}{" "}
                {stripHtmlTags(testSuite?.userId?.lastName || "")}
                {", "}
              </span>
            ) : null}
            Created on {formatDate(testSuite?.createdAt || "")}
          </span>
        </DialogHeader>
        {!isView ?
          <Tabs defaultValue={TestSuiteTabs.DESCRIPTION} className="w-full mt-4">
            <TabsList className="grid grid-cols-2 mb-4 w-full md:w-fit">
              <TabsTrigger
                value={TestSuiteTabs.DESCRIPTION}
                className="flex items-center"
              >
                Description
              </TabsTrigger>
              {!isView &&
                <TabsTrigger
                  value={TestSuiteTabs.REQUIREMENTS}
                  className="flex items-center"
                >
                  Requirements
                </TabsTrigger>
              }
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
                          <TableCell className="hover:text-primary hover:cursor-pointer"
                            onClick={() => getRequirement(requirement)}
                          >
                            {requirement.customId}</TableCell>
                          <TableCell>{stripHtmlTags(requirement.title)}</TableCell>
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
          : <div className="mt-4">
            <div
              className="px-2 text-sm leading-relaxed text-gray-700 rich-description"
              dangerouslySetInnerHTML={{
                __html: testSuite?.description || "",
              }}
            />
          </div>
        }
      </DialogContent>
    </Dialog>
  );
};

export default ViewTestSuite;
