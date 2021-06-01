const { taskQueryResolvers, taskMutationResolvers } = require("./tasks");

module.exports = {
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
  },
  // AtomMutations: {
  //   ...taskMutationResolvers,
  // },
};
