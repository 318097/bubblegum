const { ApolloServer } = require("apollo-server-lambda");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const UserModel = require("../api/user/user.model");
const TaskModel = require("../api/task/task.model");
const ExpenseModel = require("../api/expenses/expenses.model");
const TimelineModel = require("../api/timeline/timeline.model");
const { getUserFromToken } = require("../utils/authentication");
const { processId } = require("../utils/common");

const startApolloServer = () => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const { token } = req;
      if (!token) throw new Error("NO_JWT_TOKEN_FOUND");

      const user = await getUserFromToken(token);
      if (!user) throw new Error("UNAUTHORIZED");

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
};

module.exports = { startApolloServer };
