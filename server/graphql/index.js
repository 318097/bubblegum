const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const logger = require("../utils/logger");
const UserModel = require("../api/user/user.model");

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context() {
    return { UserModel };
  },
});

apolloServer
  .listen()
  .then(({ url }) => logger.log(`GraphQl running at ${url}`));
