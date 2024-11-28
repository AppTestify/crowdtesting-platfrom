"use client";

import { useEffect, useState } from "react";
import { ITestCaseData } from "@/app/_interface/test-case-data";
import { Badge } from "@/components/ui/badge";
import { Edit, Loader2, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/app/_components/confirmation-dialog";
import { deleteTestCaseDataService } from "@/app/_services/test-case-data.service";
import toasterService from "@/app/_services/toaster-service";
import { useParams } from "next/navigation";
import EditTestCaseData from "../edit-test-case-data";

export default function TestCaseDataCard({ testCaseData, refreshTestCaseData }: { testCaseData: ITestCaseData[], refreshTestCaseData: () => void }) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const { projectId } = useParams<{ projectId: string }>();
    const [testCaseDataValue, setTestCaseData] = useState<ITestCaseData | null>(null);

    const deleteTestCaseData = async () => {
        try {
            setIsLoading(true);
            const response = await deleteTestCaseDataService(projectId, testCaseData[0]?.testCaseId, testCaseDataValue?._id as string);

            if (response?.message) {
                setIsLoading(false);
                refreshTestCaseData();
                setIsDeleteOpen(false);
                toasterService.success(response.message);
            }
        } catch (error) {
            toasterService.error();
            setIsDeleteOpen(false);
            console.log("Error > deleteTestCaseData", error);
        }
    };

    return (
        <main className="mt-3">
            {/* Delete */}
            <ConfirmationDialog
                isOpen={isDeleteOpen}
                setIsOpen={setIsDeleteOpen}
                title="Delete test case data"
                description="Are you sure you want delete this test case data?"
                isLoading={isLoading}
                successAction={deleteTestCaseData}
                successLabel="Delete"
                successLoadingLabel="Deleting"
                successVariant={"destructive"}
            />

            {/* Edit */}
            <EditTestCaseData testCaseDataValue={testCaseDataValue as ITestCaseData} isEditOpen={isEditOpen} setIsEditOpen={setIsEditOpen} refreshTestCaseData={refreshTestCaseData} />

            <div className="w-full grid grid-cols-1 gap-4">
                {/* Render cards */}
                {testCaseData && testCaseData.length > 0 ? (
                    testCaseData.map((testCase) => (
                        <div key={testCase._id} className="bg-white rounded-lg border overflow-hidden">
                            <div className="p-4">
                                {/* Name and Type */}
                                <div className="flex  ">
                                    <div className="flex items-center w-[50%] space-x-2">
                                        <p className="">Name:</p>
                                        <span className="text-gray-700">{testCase.name}</span>
                                    </div>
                                    <div className="flex space-x-2 w-[50%]">
                                        <p className="text-right">Type:</p>
                                        <span className="text-gray-700">{testCase.type}</span>
                                    </div>
                                </div>

                                {/* Validation */}
                                <div className="flex items-center mt-2">
                                    <p className="w-24">Validation:</p>
                                    <div className="flex items-center justify-start w-full flex-wrap">
                                        {testCase.validation?.map((validation, index) => (
                                            <Badge key={index} className="ml-2 font-normal hover:bg-gray-400 bg-gray-400">{validation}</Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex mt-2 space-x-2">
                                    <p className="">Input value:</p>
                                    <span className=" text-gray-700">{testCase.inputValue}</span>
                                </div>
                                <div className="flex space-x-2 mt-2">
                                    <p className="text-right">Description:</p>
                                    <span className="text-gray-700">{testCase.description}</span>
                                </div>
                                <div className="mt-2">
                                    <Button
                                        type="button"
                                        className="my-1 hover:bg-primary bg-primary"
                                        onClick={() => {
                                            setIsLoading(false);
                                            setIsEditOpen(true);
                                            setTestCaseData(testCase)
                                        }}
                                    >
                                        <Edit className="h-2 w-2" /> {" "}
                                        < span className="" > Edit </span>
                                    </Button>
                                    <Button
                                        type="button"
                                        className="my-1 ml-4 hover:bg-destructive bg-destructive"
                                        onClick={() => {
                                            setIsDeleteOpen(true);
                                            setIsLoading(false);
                                            setTestCaseData(testCase)
                                        }}
                                    >
                                        <Trash className="h-2 w-2 " /> {" "}
                                        < span className="" > Delete </span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center">
                        {!isLoading ? (
                            <p className="text-xl text-gray-500">No results</p>
                        ) : (
                            <p className="text-xl text-gray-500">Loading</p>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
