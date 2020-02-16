import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    users: [User!]
    user(id: ID!): User
    me: User
  }

  extend type Mutation {
    signUp(
      first_name: String!
      last_name: String!
      phone_number: String!
      dob: Date!
      account: String
      email: String!
      password: String!
    ): Token!

    signIn(email: String!, password: String!): Token!
    updateUser(email: String!): User!
    deleteUser(id: ID!): Boolean!
  }

  type Token {
    token: String!
  }

  type User {
    id: ID!
    first_name: String!
    last_name: String!
    phone_number: String!
    dob: Date!
    account: String!
    email: String!
    role: String
    invoices: [Invoice!]
    verification: [Verification!]
  }
`;
