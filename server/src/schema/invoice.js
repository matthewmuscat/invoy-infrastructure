import { gql } from "apollo-server-express"

export default gql`
  extend type Query {
    invoices(cursor: String, limit: Int): InvoicesConnection!
    invoice(id: ID!): Invoice!
  }

  extend type Mutation {
    createInvoice(text: String!): Invoice!
    deleteInvoice(id: ID!): Boolean!
  }

  type InvoicesConnection {
    edges: [Invoice!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String!
  }

  type Invoice {
    id: ID!
    text: String!
    createdAt: Date!
    user: User!
  }

  extend type Subscription {
    InvoiceCreated: InvoiceCreated!
  }

  type InvoiceCreated {
    invoice: Invoice!
  }
`
