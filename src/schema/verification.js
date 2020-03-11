import { gql } from "apollo-server-express"

export default gql`
  extend type Mutation {
    singleUploadStream(files: [Upload!]!): Verification!
    createVerification(
      files: Upload!
    ): Verification!
  }


  type Verification {
    file_location_back: String!
    file_location_front: String!
    user: User!
  }
`
