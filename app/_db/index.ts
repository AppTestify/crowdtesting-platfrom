import mongoose from "mongoose";
import { User } from "../_models/user.model";
import { Tester } from "../_models/tester.model";
import { Device } from "../_models/device.model";
import { Browser } from "../_models/browser.model";
import { Project } from "../_models/project.model";
import { Issue } from "../_models/issue.model";
import { IssueAttachment } from "../_models/issue-attachment.model";
import { ProfilePicture } from "../_models/profile.picture";
import { Counter } from "../_models/counter.model";
import { IdFormat } from "../_models/id-format.model";
import { TestSuite } from "../_models/test-suite.model";
import { Requirement } from "../_models/requirement.model";
import { RequirementAttachment } from "../_models/requirement-attachment.model";
import { TestPlan } from "../_models/test-plan.model";
import { TestCase } from "../_models/test-case.model";
import { TestCycle } from "../_models/test-cycle.model";
import { TestCaseStep } from "../_models/test-case-step.model";
import { TestCaseResult } from "../_models/test-case-result.model";
import { Payment } from "../_models/payment.model";
import { Report } from "../_models/report.model";
import { ProjectTabAccess } from "../_models/project-tab-access.model";
import { TestCaseAttachment } from "../_models/test-case-attachment.model";
import { TestCaseDataAttachment } from "../_models/test-case-data-attachment.model";

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
    console.log(error);
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
  const counterModel = Counter;
  const idFormatModel = IdFormat;
  const testSuiteModel = TestSuite;
  const testPlanModel = TestPlan;
  const testCaseModel = TestCase;
  const testCaseResultModel = TestCaseResult;
  const NoteModel = Report;
  const testCaseStepModel = TestCaseStep;
  const paymentModel = Payment;
  const testCycleModel = TestCycle;
  const requirementModel = Requirement;
  const requirementAttachmentModel = RequirementAttachment;
  const projectTabAccessModel = ProjectTabAccess;
  const testCaseAttachmentModel = TestCaseAttachment;
  const testCaseDataAttachmentModel = TestCaseDataAttachment;
};
