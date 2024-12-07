import mongoose, { Document, model, Schema, Types } from "mongoose";
import { DBModels } from "../_constants";

export interface IWebsite extends Document {
    websiteName: string;
    timeZone: string;
    userId: Types.ObjectId;
    logo: {
        data: Buffer;
        name: string;
        contentType: string;
    }
}

const WebsiteSchema = new Schema<IWebsite>(
    {
        websiteName: { type: String, required: false },
        timeZone: { type: String, required: false },
        userId: { type: Schema.Types.ObjectId, ref: DBModels.USER, required: true },
        logo: {
            data: { type: Buffer },
            name: { type: String },
            contentType: { type: String }
        }
    },
    {
        timestamps: true,
    }
);

export const Website =
    mongoose.models.Website || model<IWebsite>(DBModels.WEBSITE, WebsiteSchema);