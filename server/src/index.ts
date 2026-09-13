import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readToken } from "./auth.js";
import type { Context } from "./resolvers.js";
import { resolvers } from "./resolvers.js";
import { typeDefs } from "./schema.js";
import { db } from "./store.js";

const server = new ApolloServer<Context>({ typeDefs, resolvers });
const port = Number(process.env.PORT ?? 4001);

const { url } = await startStandaloneServer(server, {
  listen: { port },
  context: async ({ req }) => ({
    user: readToken(req.headers.authorization),
  }),
});

const stats = db().lockers;
console.log(`Smart Package Locker GraphQL ready at ${url}`);
console.log(
  `Station: ${stats.length} lockers · ${stats.filter((l) => l.status === "AVAILABLE").length} free`
);
