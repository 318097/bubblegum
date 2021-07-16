const { taskQueryResolvers, taskMutationResolvers } = require("./tasks");
const {
  expenseQueryResolvers,
  expenseMutationResolvers,
} = require("./expenses");
const {
  timelineQueryResolvers,
  timelineMutationResolvers,
} = require("./timeline");

const {
  DateResolver,
  DateTimeResolver,
  JSONResolver,
} = require("graphql-scalars");

module.exports = {
  Date: DateResolver,
  DateTime: DateTimeResolver,
  JSON: JSONResolver,
  Query: {
    atom: () => ({}),
  },
  AtomQueries: {
    ...taskQueryResolvers,
    ...expenseQueryResolvers,
    ...timelineQueryResolvers,
  },
  Mutation: {
    atom: () => ({}),
  },
  AtomMutations: {
    ...taskMutationResolvers,
    ...expenseMutationResolvers,
    ...timelineMutationResolvers,
  },
};
