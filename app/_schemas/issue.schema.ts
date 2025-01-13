import { z } from "zod";

export const issueSchema = z.object({
  issueType: z.string().min(1, "Issue type is required"),
  title: z.string().min(1, "Title is required"),
  severity: z.string().min(1, "Severity is required"),
  priority: z.string().min(1, "Priority is required"),
  description: z.string().min(1, "Description is required"),
  projectId: z.string().min(1, "ProjectId is required"),
  status: z.string().optional(),
  device: z.array(z.string()).nonempty("Device is required"),
  testCycle: z.string().min(1, "Test cycle is required"),
  assignedTo: z.string().nullable().optional(),
});

export const issueStatusSchema = z.object({
  status: z.string().min(1, "Status is required"),
});

export const issueAttachmentsDownload = z.object({
  issueId: z.string().min(1, "IssueId is required"),
});
