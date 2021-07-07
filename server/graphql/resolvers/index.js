const { taskQueryResolvers, taskMutationResolvers } = require("./tasks");
const {
  expenseQueryResolvers,
  expenseMutationResolvers,
} = require("./expenses");
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
    me(_, args, ctx) {
      console.log(_, args, ctx);
      return {
        id: 1,
        name: "Test",
        email: "abc@test.com",
      };
    },
  },
  AtomQueries: {
    ...taskQueryResolvers,
    ...expenseQueryResolvers,
  },
  Mutation: {
    atom: () => ({}),
  },
  AtomMutations: {
    ...taskMutationResolvers,
    ...expenseMutationResolvers,
  },
};