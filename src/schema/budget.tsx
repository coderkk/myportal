import { z } from "zod";

export const createBudgetSchema = z.object({
  description: z.string().min(1, "A description is required"),
  expectedBudget: z
    .number({
      invalid_type_error: "Budget must be a number",
    })
    .positive({ message: "Budget must be positive" }),
  costsIncurred: z
    .number({
      invalid_type_error: "Budget must be a number",
    })
    .positive({ message: "Costs incurred must be positive" }),
});
