import { gql } from 'apollo-server-express';

export default gql`
  extend type Mutation {
    createVerification(
      files: [FileInput!]!
    ): [File!]!
  }

  input FileInput {
    name: String!
    lastModified: BigInt!
    lastModifiedDate: String
    size: Int!
    webkitRelativePath: String!
    type: String!
  }

  type File {
    file_location: String!
    user: User!
  }
`;
