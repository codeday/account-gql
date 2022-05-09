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
    ""
  ).split(/\s+/);
  const legacyUserTokenHeader =
    (req?.header("Account-Authorization") || "").split(/\s+/);
  if (tokenHeader.length != 2 && legacyTokenHeader.length == 2) {
    const token =
      legacyTokenHeader[0] === "Bearer"
        ? legacyTokenHeader[1].trim()
        : undefined;
    return {
      auth: new LegacyAuthContext(token),
    };
  } else if (tokenHeader.length != 2 && legacyUserTokenHeader.length == 2) {
    const token =
      legacyUserTokenHeader[0] === "Bearer"
        ? legacyUserTokenHeader[1].trim()
        : undefined;
    return {
      auth: new LegacyAuthContext(token, true),
    };
  }
  const token = tokenHeader[0] === "Bearer" ? tokenHeader[1].trim() : undefined;

  return {
    auth: new AuthContext(token),
  };
}
