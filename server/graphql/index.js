const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const logger = require("../utils/logger");
const UserModel = require("../api/user/user.model");
const TaskModel = require("../api/task/task.model");
const ExpenseModel = require("../api/expenses/expenses.model");
const config = require("../config");
const { getToken, getUser } = require("../utils/authentication");
const { processId } = require("../helpers");

const startApolloServer = async (app) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const models = {
        User: UserModel,
        Task: TaskModel,
        Expense: ExpenseModel,
      };

      let user = {};
      const token = getToken(req);
      if (token) user = await getUser(token);

      // console.log("user::-", user);

      return {
        models,
        user,
        authenticated: !!token,
        userId: processId(user._id),
      };
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
};

module.exports = { startApolloServer };
