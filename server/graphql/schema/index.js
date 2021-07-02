const { gql } = require("apollo-server-express");
const { typeDefs: scalarTypeDefs } = require("graphql-scalars");

const atomTypeDefs = gql`
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

  # Expenses
  input MonthlyExpensesInput {
    month: Int!
    year: Int
  }

  type Expense {
    _id: ID!
    amount: Int!
    userId: String!
    message: String
    date: DateTime!
    expenseTypeId: String!
    expenseSubTypeId: String
    createdAt: DateTime!
  }

  input CreateExpenseInput {
    amount: Int!
    message: String
    date: DateTime
    expenseTypeId: String!
    expenseSubTypeId: String
  }

  input UpdateExpenseInput {
    _id: ID!
    amount: Int
    message: String
    date: DateTime
    expenseTypeId: String
    expenseSubTypeId: String
  }

  input DeleteExpenseInput {
    _id: ID!
  }

  # Queries & Mutations
  type AtomQueries {
    # Tasks
    getAllTasks: [Task!]
    getTaskById(input: TaskByIdInput!): Task!
    # Expenses
    getExpensesByMonth(input: MonthlyExpensesInput!): [Expense]!
  }

  type AtomMutations {
    # Tasks
    createTask(input: CreateTaskInput!): Task!
    updateTask(input: UpdateTaskInput!): Task!
    stampTask(input: StampTaskInput!): Task!
    deleteTask(input: TaskByIdInput!): Task!
    # Expenses
    createExpense(input: CreateExpenseInput): Expense!
    updateExpense(input: UpdateExpenseInput): Expense!
    deleteExpense(input: DeleteExpenseInput): Expense!
  }
`;

const root = gql`
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

  ${atomTypeDefs}
`;

const typeDefs = [...scalarTypeDefs, root];

module.exports = typeDefs;
