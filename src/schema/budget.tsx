import { z } from "zod";
// the same schema should apply to creating and updating
export const createUpdateBudgetSchema = z.object({
  description: z.string().min(1, "A description is required"),
  expectedBudget: z
    .number({ invalid_type_error: "Budget must be a number" })
    .positive({ message: "Budget must be positive" }),
  costsIncurred: z
    .number({ invalid_type_error: "Budget must be a number" })
    .positive({ message: "Costs incurred must be positive" }),
});
