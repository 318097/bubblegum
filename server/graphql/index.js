const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const logger = require("../utils/logger");
const UserModel = require("../api/user/user.model");
const TaskModel = require("../api/task/task.model");
const ExpenseModel = require("../api/expenses/expenses.model");
const TimelineModel = require("../api/timeline/timeline.model");
const config = require("../config");
const { getToken, getUserFromToken } = require("../utils/authentication");
const { processId } = require("../utils/common");

const startApolloServer = async (app) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const token = getToken(req);
      if (!token) throw new Error("No Authorization token found.");

      const user = await getUserFromToken(token);
      if (!user) throw new Error("Unauthorized.");
      // console.log("user::-", user);

      const models = {
        User: UserModel,
        Task: TaskModel,
        Expense: ExpenseModel,
        Timeline: TimelineModel,
      };

      return {
        models,
        user,
        userId: processId(user._id),
      };
    },
    playground: {
      settings: {
        "schema.polling.enable": false,
      },
    },
  });

  await server.start();
  server.applyMiddleware({
    app,
    // cors: false,
    // path: "/",
  });

  logger.log(
    `🚀 GraphQL server running at :${config.PORT}${server.graphqlPath}`
  );
};

module.exports = { startApolloServer };
