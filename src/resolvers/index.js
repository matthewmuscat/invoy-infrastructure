import { GraphQLDateTime } from "graphql-iso-date"
import BigInt from "apollo-type-bigint"

import userResolvers from "./user"
import invoiceResolvers from "./invoice"
import verificationResolvers from "./verification"

const customScalarResolver = {
  Date: GraphQLDateTime,
  BigInt: new BigInt("safe"),
}

export default [
  customScalarResolver,
  userResolvers,
  invoiceResolvers,
  verificationResolvers,
]
