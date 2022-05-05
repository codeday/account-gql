import { ExpressContext } from "apollo-server-express/dist/ApolloServer";
import { AuthContext, LegacyAuthContext } from "./auth";

export * from "./auth";

export interface Context {
  auth: AuthContext | LegacyAuthContext;
}

export async function createContext({ req }: ExpressContext): Promise<Context> {
  const tokenHeader = (req?.header("X-Account-Authorization") || "")
    .split(/\s+/);
  const legacyTokenHeader = (
    req?.header("Authorization") ||
    req?.header("Account-Authorization") ||
    ""
  ).split(/\s+/);
  if (tokenHeader.length != 2 && legacyTokenHeader.length == 2) {
    const token =
      legacyTokenHeader[0] === "Bearer"
        ? legacyTokenHeader[1].trim()
        : undefined;
    return {
      auth: new LegacyAuthContext(token),
    };
  }
  const token = tokenHeader[0] === "Bearer" ? tokenHeader[1].trim() : undefined;

  return {
    auth: new AuthContext(token),
  };
}
