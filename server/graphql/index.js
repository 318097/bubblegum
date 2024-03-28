const { ApolloServer: ApolloServerLambda } = require("apollo-server-lambda");
const { ApolloServer: ApolloServerExpress } = require("apollo-server-express");

const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const UserModel = require("../api/user/user.model");
const TaskModel = require("../api/task/task.model");
const ExpenseModel = require("../api/expenses/expenses.model");
const TimelineModel = require("../api/timeline/timeline.model");
const { getUserFromToken } = require("../utils/authentication");
const { processId, getAppBasedInfo } = require("../utils/common");
const logger = require("../utils/logger");
const config = require("../config");

const options = {
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const { token } = req;
    if (!token) throw new Error("NO_JWT_TOKEN_FOUND");

    const user = await getUserFromToken(token);
    const appBasedInfo = await getAppBasedInfo({
      user,
      source: req.headers.source,
    });
    if (!user) throw new Error("UNAUTHORIZED");

    const models = {
      User: UserModel,
      Task: TaskModel,
      Expense: ExpenseModel,
      Timeline: TimelineModel,
    };

    return {
      models,
      user: {
        ...user,
        ...appBasedInfo,
      },
      userId: processId(user._id),
    };
  },
  playground: {
    settings: {
      "schema.polling.enable": false,
    },
  },
};

const startApolloServerLambda = () => {
  try {
    return new ApolloServerLambda(options);
  } catch (er) {
    console.error(er);
  }
};

const startApolloServerExpress = async (app) => {
  const server = new ApolloServerExpress(options);
  await server.start();
  server.applyMiddleware({
    app,
    // cors: false,
    // path: "/",
  });

  logger.log(
    `🚀 GraphQL server running at ':${config.PORT}${server.graphqlPath}'`
  );
};

module.exports = { startApolloServerLambda, startApolloServerExpress };
