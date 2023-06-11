import { z } from "zod";

export const createBudgetSchema = z.object({
  projectId: z.string().min(1, "A projectId is required"),
  description: z.string().trim().min(1, "A description is required"),
  expectedBudget: z
    .number({ invalid_type_error: "Budget must be a number" })
    .positive({ message: "Budget must be positive" }),
  costsIncurred: z
    .number({ invalid_type_error: "Budget must be a number" })
    .positive({ message: "Costs incurred must be positive" }),
});

export const updateBudgetSchema = createBudgetSchema
  .omit({ projectId: true })
  .extend({
    budgetId: z.string().min(1, "A budgetId is required"),
  });
