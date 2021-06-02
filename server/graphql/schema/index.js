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

  enum TaskStampAction {
    MARK
    UNMARK
  }

  type Stamp {
    _id: ID!
    message: String
    date: String!
  }

  type Task {
    _id: ID!
    content: String!
    userId: String!
    type: TaskType!
    status: String
    frequency: Int
    deadline: String
    deleted: Boolean!
    createdAt: String
    completedOn: String
    stamps: [Stamp!]
  }

  input CreateTaskInput {
    content: String!
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

  input StampTaskInput {
    _id: ID!
    date: String
    message: String
    type: TaskType!
    action: TaskStampAction!
    stampId: String
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
    stampTask(input: StampTaskInput!): Task!
    deleteTask(input: TaskByIdInput!): Task!
  }
`;

module.exports = typeDefs;
