import mongoose, { Schema, model, Document, Types } from "mongoose";
import { DBModels } from "../_constants";
import { UserRoles } from "../_constants/user-roles";
import { Counter } from "./counter.model";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  accountActivationMailSentAt: Date;
  profilePicture: string;
  paypalId: string;
  projects: Types.ObjectId[];
  sendCredentials: boolean;
  credentialsSentAt: Date;
  customId: number;
  rememberMe: boolean;
  phoneNumber?: number;
  companyName?: string;
  country?: string;
  setuser?: string;
  webAddress?: string;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      default: UserRoles.CLIENT,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    accountActivationMailSentAt: {
      type: Date,
      default: null,
    },
    profilePicture: {
      type: String,
      ref: DBModels.PROFILE_PICTURE,
      required: false,
    },
    paypalId: {
      type: String,
      required: false,
    },
    projects: [{ type: Schema.Types.ObjectId, ref: DBModels.PROJECT }],
    sendCredentials: {
      type: Boolean,
      default: false,
    },
    credentialsSentAt: {
      type: Date,
    },
    customId: { type: Number },
    rememberMe: {
      type: Boolean,
      required: false,
    },
    phoneNumber: {
      type: Number,
    },
    companyName: {
      type: String,
    },
    country: {
      type: String,
    },
    setuser: {
      type: String,
    },
    webAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isNew) {
    try {
      // Get the next sequence number for the customId
      const counter = await Counter.findOneAndUpdate(
        { entity: DBModels.USER },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
      );

      // Assign the new customId to the user`
      user.customId = counter.sequence;
      next();
    } catch (err: any) {
      next(err);
    }
  } else {
    next();
  }
});

export const User =
  mongoose.models.User || model<IUser>(DBModels.USER, userSchema);
