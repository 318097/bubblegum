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

  enum TaskStampActionType {
    TASK
    SUBTASK
  }

  type Stamp {
    _id: ID!
    message: String
    date: DateTime!
  }

  type Task {
    _id: ID!
    content: String!
    userId: String!
    type: TaskType!
    status: String
    frequency: Int
    deadline: DateTime
    deleted: Boolean!
    createdAt: DateTime
    completedOn: DateTime
    stamps: [Stamp!]
  }

  input CreateTaskInput {
    content: String!
    type: TaskType!
    status: String
    deadline: DateTime
  }

  input UpdateTaskInput {
    _id: ID!
    content: String
    userId: String
    type: TaskType
    status: String
    deadline: DateTime
  }

  input StampTaskInput {
    _id: ID!
    date: DateTime
    message: String
    action: TaskStampAction!
    actionType: TaskStampActionType!
    subTaskId: String
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
    favorite: Boolean
  }

  input CreateExpenseInput {
    amount: Int!
    message: String
    date: DateTime
    expenseTypeId: String!
    expenseSubTypeId: String
  }

  input FavoriteExpenseInput {
    _id: ID!
    status: Boolean!
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

  # Timeline
  input GetTimelineInput {
    groupId: ID
    search: String
    page: Int
    limit: Int
  }

  input CreateTimelineInput {
    groupId: [ID!]
    content: String!
    date: DateTime!
  }

  input UpdateTimelineInput {
    _id: ID!
    groupId: [ID]
    content: String
    date: DateTime
  }

  input DeleteTimelineInput {
    _id: ID!
  }

  type Timeline {
    _id: ID!
    content: String!
    userId: String!
    date: DateTime
    groupId: [ID]!
    createdAt: DateTime
  }

  # Queries & Mutations
  type AtomQueries {
    # Tasks
    getAllTasks: [Task!]
    getTaskById(input: TaskByIdInput!): Task!
    # Expenses
    getExpensesByMonth(input: MonthlyExpensesInput!): [Expense]!
    expenseStats: JSON!
    # Timeline
    getTimeline(input: GetTimelineInput!): [Timeline]!
  }

  type AtomMutations {
    # Tasks
    createTask(input: CreateTaskInput!): Task!
    updateTask(input: UpdateTaskInput!): Task!
    stampTask(input: StampTaskInput!): Task!
    deleteTask(input: TaskByIdInput!): Task!
    # Expenses
    createExpense(input: CreateExpenseInput): Expense!
    toggleFavoriteExpense(input: FavoriteExpenseInput): Expense!
    updateExpense(input: UpdateExpenseInput): Expense!
    deleteExpense(input: DeleteExpenseInput): Expense!
    # Timeline
    createTimelinePost(input: CreateTimelineInput): Timeline!
    updateTimelinePost(input: UpdateTimelineInput): Timeline!
    deleteTimelinePost(input: DeleteTimelineInput): Timeline!
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
