import mongoose from "mongoose";
import { User } from "../_models/user.model";

export const connectDatabase = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      return false;
    }
    await mongoose.connect(MONGO_URI);
    registerModels();
    return true;
  } catch (error) {
    return false;
  }
};

export const registerModels = () => {
  const userModel = User;
};
