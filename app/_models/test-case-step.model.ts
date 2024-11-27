import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";

export interface ITestCaseStep extends Document {
    userId: Types.ObjectId;
    projectId: Types.ObjectId;
    testCaseId: Types.ObjectId;
    description: string;
    additionalSelectType: string;
    selectedType: boolean;
    order: number;
}

const TestCaseStepSchema = new Schema<ITestCaseStep>(
    {
        description: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
        projectId: { type: Schema.Types.ObjectId, ref: DBModels.PROJECT, required: true },
        testCaseId: { type: Schema.Types.ObjectId, ref: DBModels.TEST_CASE, required: true },
        additionalSelectType: String,
        selectedType: Boolean,
        order: Number
    },
    {
        timestamps: true,
    }
);

export const TestCaseStep =
    mongoose.models.TestCaseStep || model<ITestCaseStep>(DBModels.TEST_CASE_STEP, TestCaseStepSchema);