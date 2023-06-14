import { z } from "zod";

const msg = "A valid email is required";
export const OAuthSchema = z.object({
  email: z.string().email({ message: msg }).min(5, msg),
});
