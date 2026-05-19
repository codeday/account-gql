import { config as loadEnv } from "dotenv";
import fetch from "node-fetch";

loadEnv();

const endpoint = process.env.GRAPHQL_ENDPOINT || "http://localhost:5000/graphql";
const apiKey = process.env.API_KEY;
const auth0Domain = process.env.AUTH0_DOMAIN || "";
const canRunAuth0BackedChecks = auth0Domain.length > 0 && !auth0Domain.endsWith(".invalid");
const strictMode = process.argv.includes("--strict") || process.env.TEST_QUERIES_STRICT === "1";

type GraphQLResponse<T> = {
    data?: T;
    errors?: Array<{ message: string }>;
};

async function request<T>(query: string, variables: Record<string, unknown> = {}, token?: string) {
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "X-Account-Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
    });

    const json = (await response.json()) as GraphQLResponse<T>;

    if (!response.ok || json.errors?.length) {
        const messages = json.errors?.map((error) => error.message).join("; ") || response.statusText;
        throw new Error(messages);
    }

    return json.data as T;
}

async function main() {
    console.log(`Testing GraphQL endpoint: ${endpoint}`);

    const publicData = await request<{ __typename: string }>(`
    query PublicHealth {
      __typename
    }
  `);
    console.log(`Public query OK: typename=${publicData.__typename}`);

    if (!apiKey) {
        console.log("No API_KEY provided; skipping authenticated query.");
        return;
    }

    const authedData = await request<{ __typename: string }>(
        `
      query AuthedHealth {
        __typename
      }
    `,
        {},
        apiKey
    );

    console.log(`Authenticated query OK: typename=${authedData.__typename}`);

    if (!canRunAuth0BackedChecks) {
        const skipReason = "Skipping Auth0-backed resolver checks (AUTH0_DOMAIN is unset or uses .invalid placeholder).";
        if (strictMode) {
            throw new Error(`Strict mode enabled: ${skipReason}`);
        }
        console.log(skipReason);
        return;
    }

    const rolesData = await request<{ roles: Array<{ id: string; name: string }> }>(`
    query PublicRoles {
      roles {
        id
        name
      }
    }
  `);

    console.log(`Auth0-backed query OK: roles=${rolesData.roles?.length || 0}`);
}

main().catch((error) => {
    console.error("Query test failed:", error.message || error);
    process.exit(1);
});
