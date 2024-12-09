import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";

export interface ITestCaseResult extends Document {
    userId: Types.ObjectId;
    testCycleId: Types.ObjectId;
    testCaseId: Types.ObjectId;
    remarks: string;
    result: string;
    actualResult: string;
    updatedAt: Date;
    updatedBy: string;
    isIssue: boolean;
    issueId: Types.ObjectId;
}


const TestCaseResultSchema = new Schema<ITestCaseResult>(
    {
        userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
        testCycleId: { type: Schema.Types.ObjectId, ref: DBModels.TEST_CYCLE, required: true },
        testCaseId: { type: Schema.Types.ObjectId, ref: DBModels.TEST_CASE, required: true },
        remarks: { type: String, required: false },
        result: { type: String, required: false },
        actualResult: { type: String, required: false },
        updatedAt: { type: Date, default: null },
        updatedBy: { type: String, required: false },
        isIssue: { type: Boolean, required: false },
        issueId: { type: Schema.Types.ObjectId, ref: DBModels.ISSUE, required: false },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

export const TestCaseResult =
    mongoose.models.TestCaseResult || model<ITestCaseResult>(DBModels.TEST_CASE_RESULT, TestCaseResultSchema);
