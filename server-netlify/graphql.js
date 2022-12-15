const { startApolloServer } = require("../server/graphql");

exports.handler = startApolloServer().createHandler();
