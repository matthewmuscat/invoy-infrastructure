import gql from "graphql-tag"

export const GET_ALL_MESSAGES_WITH_USERS_QUERY = gql`
  query {
    messages(order: "DESC") @connection(key: "MessagesConnection") {
      edges {
        id
        text
        createdAt
        user {
          id
          email
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`