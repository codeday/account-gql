import { config as loadEnv } from "dotenv";

loadEnv();

[
    'AUTH_SECRET',
    'AUTH0_DOMAIN',
    'AUTH0_CLIENT_ID',
    'AUTH0_CLIENT_SECRET',
    'DISCORD_BOT_TOKEN',
    'ROLE_CODES',
    'AUTH0_HOOK_SHARED_SECRET'
].forEach((req) => { if (!process.env[req]) throw Error(`The ${req} environment variable is required.`); });

const config = {
  debug: process.env.NODE_ENV !== "production",
  port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 5000,
  auth: {
    secret: process.env.AUTH_SECRET!,
    userSecret: process.env.AUTH0_HOOK_SHARED_SECRET!,
  },
  auth0: {
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  },
  roleCodes: process.env.ROLE_CODES!,
  discordBotToken: process.env.DISCORD_BOT_TOKEN!
};

export default config;
