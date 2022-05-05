import path from "path";
import { buildSchema } from "type-graphql";
import { GraphQLSchema } from "graphql";
import { Container } from "typedi";
import resolvers from "./resolvers";
import { authChecker } from "./context";
import { PubSub } from "graphql-subscriptions";

export async function createSchema(): Promise<GraphQLSchema> {
  const pubSub = new PubSub();
  return buildSchema({
    resolvers,
    container: Container,
    emitSchemaFile: path.resolve(
      __dirname,
      "../generated/generated-schema.graphql"
    ),
    validate: false,
    authChecker,
    pubSub,
  });
}
