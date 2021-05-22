module.exports = {
  Query: {
    me(_, args, ctx) {
      console.log(_, args, ctx);
      return {
        id: 1,
        name: "Test",
        email: "abc@test.com",
      };
    },
  },
};
