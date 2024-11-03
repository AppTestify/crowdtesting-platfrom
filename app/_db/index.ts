import mongoose from "mongoose";
import { User } from "../_models/user.model";
import { Tester } from "../_models/tester.model";
import { Device } from "../_models/device.model";
import { Browser } from "../_models/browser.model";
import { Project } from "../_models/project.model";
import { Issue } from "../_models/issue.model";
import { IssueAttachment } from "../_models/issue-attachment.model";
import { ProfilePicture } from "../_models/profile.picture";

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
  const testerModel = Tester;
  const deviceModel = Device;
  const broswerModel = Browser;
  const projectModel = Project;
  const issueModel = Issue;
  const issueAttachmentModel = IssueAttachment;
  const profilePicture = ProfilePicture;
};
