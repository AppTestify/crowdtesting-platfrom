import mongoose, { Schema, model, Document, Types } from "mongoose";
import { DBModels } from "../_constants";
import { UserRoles } from "../_constants/user-roles";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
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
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User =
  mongoose.models.User || model<IUser>(DBModels.USER, userSchema);
