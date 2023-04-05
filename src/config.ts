import { config as loadEnv } from "dotenv";

loadEnv();

[
    'AUTH_SECRET',
    'AUTH0_DOMAIN',
    'AUTH0_CLIENT_ID',
    'AUTH0_CLIENT_SECRET',
    'DISCORD_BOT_TOKEN',
    'AUTH0_HOOK_SHARED_SECRET',
    'UPLOADER_BASE'
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
  uploader: {
    base: <string>process.env.UPLOADER_BASE,
    secret: process.env.UPLOADER_SECRET,
  },
  roleCodes: Object.keys(process.env)
  .filter((n) => n.startsWith(`ROLE_CODE_`))
  .map((n) => [n.slice("ROLE_CODE_".length).toLowerCase(), process.env[n]])
  .reduce((accum, [code, role]) => (code && role ? { ...accum, [code]: role } : accum), {})!,
  discordBotToken: process.env.DISCORD_BOT_TOKEN!
};

export default config;
