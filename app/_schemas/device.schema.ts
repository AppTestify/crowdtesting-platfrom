import { z } from "zod";

export const deviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  os: z.string().min(1, "OS is required"),
  version: z.string(),
  browsers: z.array(z.string()).nonempty("At least one browser is required"),
  country: z.string().optional(),
  city: z.string().optional(),
  network: z.string().optional(),
});

export const devicesBulkDeleteSchema = z.object({
  ids: z.array(z.string()).nonempty("At least one device is required"),
});

export const devicesIdsSchema = z.object({
  ids: z.array(z.string()),
});
