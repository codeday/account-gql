import Express, { RequestHandler } from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { graphqlUploadExpress } from "graphql-upload";
import ws from "ws";
import { execute, subscribe } from "graphql";
import { useServer } from "graphql-ws/lib/use/ws";
import { createSchema } from "./schema";
import { createContext as context } from "./context";
import config from "./config";

export default async function server(): Promise<void> {
    const schema = await createSchema();
    const app = Express();
    const httpServer = http.createServer(app);

    const apollo = new ApolloServer({
        schema,
        introspection: true,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });
    await apollo.start();

    app.use(
        "/graphql",
        graphqlUploadExpress({ maxFileSize: 100 * 1024 * 1024, maxFiles: 3 }) as RequestHandler,
        Express.json(),
        expressMiddleware(apollo, {
            context,
        })
    );

    const wsServer = new ws.Server({
        server: httpServer,
        path: "/graphql",
    });

    httpServer.listen(config.port, () => {
        useServer(
            {
                schema,
                execute,
                subscribe,
                context,
            },
            wsServer
        );

        console.log(`Listening on http://0.0.0.0:${config.port}`);
    });
}
