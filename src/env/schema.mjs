// @ts-check
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  NEXTAUTH_URL: z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth.js automatically uses the VERCEL_URL if present.
    (str) => process.env.VERCEL_URL ?? str,
    // VERCEL_URL doesn't include `https` so it cant be validated as a URL
    process.env.VERCEL ? z.string() : z.string().url()
  ),
  MY_AWS_S3_BUCKET_REGION: z.string(),
  MY_AWS_ACCESS_KEY_ID: z.string(),
  MY_AWS_SECRET_ACCESS_KEY: z.string(),
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  FACEBOOK_CLIENT_ID: z.string(),
  FACEBOOK_CLIENT_SECRET: z.string(),
  TWITCH_CLIENT_ID: z.string(),
  TWITCH_CLIENT_SECRET: z.string(),
  AZURE_AD_CLIENT_ID: z.string(),
  AZURE_AD_CLIENT_SECRET: z.string(),
  AZURE_AD_TENANT_ID: z.string(),
  TWITTER_CLIENT_ID: z.string(),
  TWITTER_CLIENT_SECRET: z.string(),
  EMAIL_FROM: z.string(),
  EMAIL_SERVER_USER: z.string(),
  EMAIL_SERVER_PASSWORD: z.string(),
  EMAIL_SERVER_HOST: z.string(),
  EMAIL_SERVER_PORT: z.string(),
  TEST_USER_ID: z.string(),
  OPENAI_API_KEY: z.string(),
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  NEXT_PUBLIC_AWS_S3_FILE_MANAGER_BUCKET_NAME: z.string(),
  NEXT_PUBLIC_AWS_S3_INVOICES_BUCKET_NAME: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
  NEXT_PUBLIC_AWS_S3_FILE_MANAGER_BUCKET_NAME:
    process.env.NEXT_PUBLIC_AWS_S3_FILE_MANAGER_BUCKET_NAME,
  NEXT_PUBLIC_AWS_S3_INVOICES_BUCKET_NAME:
    process.env.NEXT_PUBLIC_AWS_S3_INVOICES_BUCKET_NAME,
};
