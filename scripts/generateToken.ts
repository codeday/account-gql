import { config as loadEnv } from "dotenv";
import jwt from "jsonwebtoken";
import { AuthRole, JwtToken } from "../src/context/auth/JwtToken";

loadEnv();

const [eventId, roleArg] = process.argv.slice(2);
const role = (roleArg || "").toLowerCase();

if (!eventId || !role) {
    console.error("Usage: yarn generate-token -- <event-id> <admin|manager|mentor|student>");
    process.exit(1);
}

const authSecret = process.env.AUTH_SECRET;
if (!authSecret) {
    console.error("Missing AUTH_SECRET in environment.");
    process.exit(1);
}

const roleToTokenType: Record<string, AuthRole> = {
    admin: AuthRole.ADMIN,
    manager: AuthRole.USER,
    mentor: AuthRole.USER,
    student: AuthRole.USER,
};

const tokenType = roleToTokenType[role];
if (!tokenType) {
    console.error(`Unsupported role: ${role}. Use admin, manager, mentor, or student.`);
    process.exit(1);
}

const userId = tokenType === AuthRole.USER ? `${role}-${eventId}` : undefined;
const payload: JwtToken = {
    t: tokenType,
    ...(userId ? { u: userId } : {}),
};

const signed = jwt.sign(payload, authSecret, {
    expiresIn: "8h",
    issuer: "account-gql-local",
    audience: eventId,
});

console.log(signed);
