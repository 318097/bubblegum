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
        // "request.credentials": "include",
      },
      // tabs: [
      //   {
      //     name: "Tab 1",
      //     headers: {
      //       authorization:
      //         "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MDljZWM1OTY0YWRmZDdjOTc3NmRiZmUiLCJlbWFpbCI6IjMxODA5N0BnbWFpbC5jb20iLCJpYXQiOjE2MjIyNzc3MDksImV4cCI6MTYyNDg2OTcwOX0.40YEO749prMMXgyP7vU-F5Fk-F8XlP18n5_mquAt_5s",
      //     },
      //   },
      // ],
    },
  });
  await server.start();

  server.applyMiddleware({ app });
  logger.log(
    `🚀 GraphQL server running at :${config.PORT}${server.graphqlPath}`
  );
}

module.exports = { startApolloServer };
