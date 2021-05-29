// const { ApolloServer } = require("apollo-server");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const logger = require("../utils/logger");
const UserModel = require("../api/user/user.model");
const config = require("../config");

async function startApolloServer(app) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context() {
      return { UserModel };
    },
    playground: {
      settings: {
        "schema.polling.enable": false,
      },
    },
  });
  await server.start();

  server.applyMiddleware({ app });
  logger.log(
    `🚀 GraphQL server running at :${config.PORT}${server.graphqlPath}`
  );
}

module.exports = { startApolloServer };
