import { gql } from "apollo-server-express"

import userSchema from "./user"
import invoiceSchema from "./invoice"
import verificationSchema from "./verification"

const linkSchema = gql`
  scalar Date
  scalar DateTime
  scalar BigInt

  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`

export default [linkSchema, userSchema, invoiceSchema, verificationSchema]
