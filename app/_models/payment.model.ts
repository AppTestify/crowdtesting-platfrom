import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";

export interface IPayment extends Document {
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    amount: mongoose.Types.Decimal128;
    projectId: Types.ObjectId;
    description: string;
    status: string;
}

const PaymentSchema = new Schema<IPayment>(
    {
        senderId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
        receiverId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
        projectId: { type: Schema.Types.ObjectId, ref: DBModels.PROJECT, required: false },
        status: { type: String },
        amount: { type: Schema.Types.Decimal128, required: true },
        description: { type: String },
    },
    {
        timestamps: true
    }
);

export const Payment =
    mongoose.models.Payment || model<IPayment>(DBModels.PAYMENT, PaymentSchema);