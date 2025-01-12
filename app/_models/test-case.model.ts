import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";
import { Counter } from "./counter.model";

export interface ITestCase extends Document {
    title: string;
    userId: Types.ObjectId;
    projectId: Types.ObjectId;
    customId: number;
    expectedResult: string;
    testSuite: Types.ObjectId;
    requirements: [Types.ObjectId];
}


const TestCaseSchema = new Schema<ITestCase>(
    {
        title: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
        projectId: { type: Schema.Types.ObjectId, ref: DBModels.PROJECT, required: true },
        customId: { type: Number },
        expectedResult: { type: String, required: true },
        testSuite: { type: Schema.Types.ObjectId, ref: DBModels.TEST_SUITE, required: true },
        requirements: [{ type: Schema.Types.ObjectId, ref: DBModels.REQUIREMENT, required: true }],
    },
    {
        timestamps: true,
    }
);

TestCaseSchema.pre('save', async function (next) {
    const testCase = this;
    if (testCase.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { entity: DBModels.TEST_CASE, projectId: testCase.projectId },
                { $inc: { sequence: 1 } },
                { new: true, upsert: true }
            );

            testCase.customId = counter.sequence;
            next();
        } catch (err: any) {
            next(err);
        }
    } else {
        next();
    }
});

export const TestCase =
    mongoose.models.TestCase || model<ITestCase>(DBModels.TEST_CASE, TestCaseSchema);
