import gql from "graphql-tag"

export const GET_ALL_INVOICES_WITH_USERS_QUERY = gql`
  query {
    invoices(order: "DESC") @connection(key: "InvoicesConnection") {
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