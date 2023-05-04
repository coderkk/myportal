import NextAuth, { type NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import DiscordProvider from "next-auth/providers/discord";
import EmailProvider from "next-auth/providers/email";
import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import TwitchProvider from "next-auth/providers/twitch";
import TwitterProvider from "next-auth/providers/twitter";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import nodemailer from "nodemailer";
import { env } from "../../../env/server.mjs";
import { prisma } from "../../../server/db";

export const authOptions: NextAuthOptions = {
  // Include additional fields on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.name = user.name;
        session.user.phoneNumber = user.phoneNumber;
        session.user.company = user.company;
      }
      return session;
    },
  },
  // Disable default pages - https://next-auth.js.org/configuration/pages
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/", // Error code passed in query string as ?error=
    verifyRequest: "/post-email-sign-in", // (used for check email message)
    newUser: "/", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
    }),
    TwitchProvider({
      clientId: env.TWITCH_CLIENT_ID,
      clientSecret: env.TWITCH_CLIENT_SECRET,
    }),
    AzureADProvider({
      clientId: env.AZURE_AD_CLIENT_ID,
      clientSecret: env.AZURE_AD_CLIENT_SECRET,
      tenantId: env.AZURE_AD_TENANT_ID,
    }),
    TwitterProvider({
      clientId: env.TWITTER_CLIENT_ID,
      clientSecret: env.TWITTER_CLIENT_SECRET,
      version: "2.0",
    }),
    EmailProvider({
      server: {
        host: env.EMAIL_SERVER_HOST,
        port: Number(env.EMAIL_SERVER_PORT),
        auth: {
          user: env.EMAIL_SERVER_USER,
          pass: env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: env.EMAIL_FROM,
      maxAge: 10 * 60, // Magic links are valid for 10 min only
      async sendVerificationRequest({
        identifier: email,
        url,
        provider: { server, from },
      }) {
        const { host } = new URL(url);
        const transport = nodemailer.createTransport(server);
        await transport.sendMail({
          to: email,
          from,
          subject: `Sign in to ${host}`,
          text: text({ url, host }),
          html: html({ url, host, email }),
        });
      },
    }),
    /**
     * ...add more providers here
     *
     * Most other providers require a bit more work than the Discord provider.
     * For example, the GitHub provider requires you to add the
     * `refresh_token_expires_in` field to the Account model. Refer to the
     * NextAuth.js docs for the provider you want to use. Example:
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

//Customize sign-in email
const html = ({
  url,
  host,
  email,
}: Record<"url" | "host" | "email", string>) => {
  const escapedEmail = `${email.replace(/\./g, "&#8203;.")}`;
  const escapedHost = `${host.replace(/\./g, "&#8203;.")}`;
  return `
  <body class="dark-mode-bg-gray-999" style="margin: 0; width: 100%; padding: 0; word-break: break-word; -webkit-font-smoothing: antialiased; background-color: #f3f4f6;">
  <div style="display: none;">
     Click to sign in &#847; &#847; &#847; &#847; &#847; &#847; &#847;
     &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
     &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
     &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
     &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
     &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &zwnj;
     &#160;&#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
     &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
     &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
     &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
     &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
     &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &zwnj;
     &#160;&#847; &#847; &#847; &#847; &#847;
  </div>
  <div role="article" aria-roledescription="email" aria-label="Confirm your email address" lang="en">
     <table class="sm-w-full" align="center" style="width: 600px;" cellpadding="0" cellspacing="0" role="presentation"></table>
     <table style="width: 100%; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
           <td align="center" class="dark-mode-bg-gray-999" style="background-color: #f3f4f6;">
              <table class="sm-w-full" style="width: 600px;" cellpadding="0" cellspacing="0" role="presentation">
                 <tr>
                    <td align="center" class="sm-px-24">
                       <table style="margin-bottom: 48px; width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                          <tr>
                             <td class="dark-mode-bg-gray-989 dark-mode-text-gray-979 sm-px-24" style="background-color: #ffffff; padding: 48px; text-align: left; font-size: 16px; line-height: 24px; color: #1f2937;">
                                <p class="sm-leading-32 dark-mode-text-white" style="margin: 0; margin-bottom: 36px; font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif; font-size: 24px; font-weight: 600; color: #000000;">
                                   Sign in to ${escapedHost}
                                </p>
                                <p style="margin: 0; margin-bottom: 24px;">
                                   Sign in as ${escapedEmail}
                                </p>
                                <a href=${url} class="hover-bg-blue-600" style="display: inline-block; background-color: #3b82f6; padding-left: 24px; padding-right: 24px; padding-top: 16px; padding-bottom: 16px; text-align: center; font-size: 16px; font-weight: 600; text-transform: uppercase; color: #ffffff; text-decoration: none;">
                                   <!--[if mso
                                      ]><i
                                      style="
                                      letter-spacing: 24px;
                                      mso-font-width: -100%;
                                      mso-text-raise: 30px;
                                      "
                                      >&#8202;</i><!
                                   [endif]-->
                                   <span style="mso-text-raise: 16px">Sign in</span>
                                   <!--[if mso
                                      ]><i style="letter-spacing: 24px; mso-font-width: -100%">&#8202;</i><!
                                   [endif]-->
                                </a>
                                <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                                   <tr>
                                      <td style="padding-top: 32px; padding-bottom: 32px;">
                                         <hr style="border-bottom-width: 0px; border-color: #f3f4f6;">
                                      </td>
                                   </tr>
                                </table>
                                <p style="margin: 0; margin-bottom: 16px; color: #6b7280;">
                                   Button not working? Copy and paste the link below into your web browser
                                   <a href=${url} style="color: #6b7280;">${url}</a>
                                </p>
                                <p style="margin: 0; margin-bottom: 16px; color: #6b7280;">
                                   If you did not make this request, you can ignore this email
                                </p>
                             </td>
                          </tr>
                       </table>
                    </td>
                 </tr>
              </table>
           </td>
        </tr>
     </table>
  </div>
</body>`;
};

// Email Text body (fallback for email clients that don't render HTML, e.g. feature phones)
const text = ({ url, host }: Record<"url" | "host", string>) => {
  return `Sign in to ${host}\n${url}\n\n`;
};

export default NextAuth(authOptions);
