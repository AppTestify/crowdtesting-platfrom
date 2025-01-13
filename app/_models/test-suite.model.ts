import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";
import { Counter } from "./counter.model";

export interface ITestSuite extends Document {
    title: string;
    description: string;
    userId: Types.ObjectId;
    projectId: Types.ObjectId;
    customId: number;
    requirements: Types.ObjectId[];
}

const TestSuiteSchema = new Schema<ITestSuite>(
    {
        title: { type: String, required: true },
        description: { type: String, required: false },
        userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
        projectId: { type: Schema.Types.ObjectId, ref: DBModels.PROJECT, required: true },
        customId: { type: Number },
        requirements: [
            { type: Schema.Types.ObjectId, ref: DBModels.REQUIREMENT }
        ],
    },
    {
        timestamps: true,
    }
);

TestSuiteSchema.pre('save', async function (next) {
    const testSuite = this;

    if (testSuite.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { entity: DBModels.TEST_SUITE, projectId: testSuite.projectId },
                { $inc: { sequence: 1 } },
                { new: true, upsert: true }
            );

            testSuite.customId = counter.sequence;
            next();
        } catch (err: any) {
            next(err);
        }
    } else {
        next();
    }
});

export const TestSuite =
    mongoose.models.TestSuite || model<ITestSuite>(DBModels.TEST_SUITE, TestSuiteSchema);
