import { z } from "zod";

export const createProjectSchema = z.object({
  projectName: z.string().trim().min(1, "A project name is required"),
});

export const updateProjectSchema = createProjectSchema;
