import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ITestPlan } from "@/app/_interface/test-plan";
import { formatDate } from "@/app/_constants/date-formatter";
import { Separator } from "@/components/ui/separator";
import DefaultComments from "../../../comments";
import { DBModels } from "@/app/_constants";
import { UserCircle2Icon, FileText, Calendar, Users, Settings } from "lucide-react";
import { NAME_NOT_SPECIFIED_ERROR_MESSAGE } from "@/app/_constants/errors";
import { displayDate } from "@/app/_utils/common-functionality";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ViewTestPlan = ({
  testPlan,
  sheetOpen,
  setSheetOpen,
}: {
  testPlan: ITestPlan;
  sheetOpen: boolean;
  setSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {

  return (
    <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            Test Plan Details
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            View comprehensive information about this test plan including parameters, assignments, and timeline.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Information Card */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential details about this test plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-[80px]">ID:</span>
                <span className="text-sm text-blue-600 font-semibold">{testPlan?.customId}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-[80px]">Title:</span>
                <span className="text-sm text-gray-900 font-medium">{testPlan?.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-[80px]">Created:</span>
                <span className="text-sm text-gray-600">
                  {testPlan?.userId?.firstName ? (
                    <span>
                      by {testPlan?.userId?.firstName}{" "}
                      {testPlan?.userId?.lastName}{", "}
                    </span>
                  ) : null}
                  {formatDate(testPlan?.createdAt || "")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Assignment & Timeline Card */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Assignment & Timeline
              </CardTitle>
              <CardDescription>
                Assignment details and project timeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-[80px]">Assignee:</span>
                <span className="text-sm flex items-center">
                  <UserCircle2Icon className="text-gray-600 h-4 w-4 mr-1" />
                  {testPlan?.assignedTo?._id ? (
                    `${testPlan?.assignedTo?.firstName ||
                    NAME_NOT_SPECIFIED_ERROR_MESSAGE
                    } ${testPlan?.assignedTo?.lastName || ""}`
                  ) : (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-[80px]">Timeline:</span>
                <span className="text-sm text-gray-600">
                  {displayDate(testPlan)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Test Parameters Card */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Test Parameters
              </CardTitle>
              <CardDescription>
                Testing parameters and their detailed descriptions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testPlan?.parameters?.map((parameter, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-purple-600">{index + 1}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800">
                      {parameter?.parameter}
                    </h4>
                  </div>
                  <Separator className="my-3" />
                  <div
                    className="text-sm leading-relaxed text-gray-700 rich-description"
                    dangerouslySetInnerHTML={{
                      __html: parameter?.description || "",
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                Comments & Discussion
              </CardTitle>
              <CardDescription>
                View and add comments related to this test plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DefaultComments project={testPlan?.projectId} entityId={testPlan?.id} entityName={DBModels.TEST_PLAN} />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTestPlan;
