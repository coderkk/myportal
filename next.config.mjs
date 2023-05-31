// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    domains: [
      "cdn.discordapp.com",
      "images.unsplash.com",
      "lh3.googleusercontent.com",
      "static-cdn.jtvnw.net", // Twitch
      "pbs.twimg.com", // Twitter
    ],
  },
  async redirects() {
    return [
      {
        source: "/api/auth/signin", // since we disabled the default pages, the only way we get here is if we hit the OAuthAccountNotLinked error. If so,
        // redirect to the error page with "?error=OAuthAccountNotLinked" (nextjs does this for us)
        destination: "/error",
        permanent: true,
      },
    ];
  },
};
export default config;
