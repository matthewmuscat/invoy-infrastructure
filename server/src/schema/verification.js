import { gql } from 'apollo-server-express';

export default gql`
  extend type Mutation {
    createVerification(
      files: [FileInput!]!
    ): Verification!
  }

  input FileInput {
    name: String!
    lastModified: BigInt!
    lastModifiedDate: String
    size: Int!
    webkitRelativePath: String!
    type: String!
  }

  type Verification {
    file_location_back: String!
    file_location_front: String!
    user: User!
  }
`;
