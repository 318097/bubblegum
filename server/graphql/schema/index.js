const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Query {
    me: User!
    atom: AtomQueries
  }

  # type Mutation {
  #   atom: AtomMutations
  # }

  type User {
    id: ID!
    name: String!
    email: String!
  }

  # type TaskType

  type Task {
    _id: ID!
    content: String!
    userId: String!
    type: String!
    status: String
    # frequency: Number
    deadline: String
    deleted: Boolean!
  }

  input TaskInput {
    _id: ID!
  }

  type AtomQueries {
    getAllTasks: [Task!]
    getTaskById(input: TaskInput!): Task!
  }
`;

module.exports = typeDefs;
