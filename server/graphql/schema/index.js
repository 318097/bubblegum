const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Query {
    me: User!
    atom: AtomQueries
  }

  type Mutation {
    atom: AtomMutations
  }

  type User {
    id: ID!
    name: String!
    email: String!
  }

  enum TaskType {
    TODO
    GOAL
    PROGRESS
  }

  type Task {
    _id: ID!
    content: String!
    userId: String!
    type: TaskType!
    status: String
    # frequency: Number
    deadline: String
    deleted: Boolean!
  }

  input CreateTaskInput {
    content: String!
    userId: String!
    type: TaskType!
    status: String
    deadline: String
  }

  input UpdateTaskInput {
    _id: ID!
    content: String
    userId: String
    type: TaskType
    status: String
    deadline: String
  }

  input TaskByIdInput {
    _id: ID!
  }

  type AtomQueries {
    getAllTasks: [Task!]
    getTaskById(input: TaskByIdInput!): Task!
  }

  type AtomMutations {
    createTask(input: CreateTaskInput!): Task!
    updateTask(input: UpdateTaskInput!): Task!
    stampTask(input: UpdateTaskInput!): Task!
    deleteTask(input: TaskByIdInput!): Task!
  }
`;

module.exports = typeDefs;
