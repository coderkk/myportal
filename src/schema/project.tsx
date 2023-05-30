import { z } from "zod";

export const createProjectSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
});
