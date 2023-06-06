// import * as cdk from "aws-cdk-lib";
// import * as cf from "aws-cdk-lib/aws-cloudfront";

import type { SSTConfig } from "sst";
import { NextjsSite } from "sst/constructs";
import { env as clientEnv } from "./src/env/client.mjs";
import { env as serverEnv } from "./src/env/server.mjs";

export default {
  config() {
    return {
      name: "myportal",
      region: "ap-southeast-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      // const certificate = new acm.Certificate(stack, "certificate", {
      //   domainName: "*.godigitalcloud.com",
      //   subjectAlternativeNames: ["godigitalcloud.com"],
      //   certificateName: "",
      //   validation: acm.CertificateValidation.fromDns(),
      // });
      const site = new NextjsSite(stack, "site", {
        timeout: "300 seconds",
        environment: {
          DATABASE_URL: serverEnv.DATABASE_URL,
          NEXTAUTH_SECRET: serverEnv.NEXTAUTH_SECRET,
          NEXTAUTH_URL: serverEnv.NEXTAUTH_URL,
          MY_AWS_S3_BUCKET_REGION: serverEnv.MY_AWS_S3_BUCKET_REGION,
          MY_AWS_S3_ACCESS_KEY_ID: serverEnv.MY_AWS_S3_ACCESS_KEY_ID,
          MY_AWS_S3_SECRET_ACCESS_KEY: serverEnv.MY_AWS_S3_SECRET_ACCESS_KEY,
          DISCORD_CLIENT_ID: serverEnv.DISCORD_CLIENT_ID,
          DISCORD_CLIENT_SECRET: serverEnv.DISCORD_CLIENT_SECRET,
          GOOGLE_CLIENT_ID: serverEnv.GOOGLE_CLIENT_ID,
          GOOGLE_CLIENT_SECRET: serverEnv.GOOGLE_CLIENT_SECRET,
          FACEBOOK_CLIENT_ID: serverEnv.FACEBOOK_CLIENT_ID,
          FACEBOOK_CLIENT_SECRET: serverEnv.FACEBOOK_CLIENT_SECRET,
          TWITCH_CLIENT_ID: serverEnv.TWITCH_CLIENT_ID,
          TWITCH_CLIENT_SECRET: serverEnv.TWITCH_CLIENT_SECRET,
          AZURE_AD_CLIENT_ID: serverEnv.AZURE_AD_CLIENT_ID,
          AZURE_AD_CLIENT_SECRET: serverEnv.AZURE_AD_CLIENT_SECRET,
          AZURE_AD_TENANT_ID: serverEnv.AZURE_AD_TENANT_ID,
          TWITTER_CLIENT_ID: serverEnv.TWITTER_CLIENT_ID,
          TWITTER_CLIENT_SECRET: serverEnv.TWITTER_CLIENT_SECRET,
          EMAIL_FROM: serverEnv.EMAIL_FROM,
          EMAIL_SERVER_USER: serverEnv.EMAIL_SERVER_USER,
          EMAIL_SERVER_PASSWORD: serverEnv.EMAIL_SERVER_PASSWORD,
          EMAIL_SERVER_HOST: serverEnv.EMAIL_SERVER_HOST,
          EMAIL_SERVER_PORT: serverEnv.EMAIL_SERVER_PORT,
          OPENAI_API_KEY: serverEnv.OPENAI_API_KEY,
          NEXT_PUBLIC_AWS_S3_FILE_MANAGER_BUCKET_NAME:
            clientEnv.NEXT_PUBLIC_AWS_S3_FILE_MANAGER_BUCKET_NAME,
          NEXT_PUBLIC_AWS_S3_INVOICES_BUCKET_NAME:
            clientEnv.NEXT_PUBLIC_AWS_S3_INVOICES_BUCKET_NAME,
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
