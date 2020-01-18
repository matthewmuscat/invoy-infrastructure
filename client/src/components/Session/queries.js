import gql from "graphql-tag"

export const GET_ME = gql`
  {
    me {
      id
      first_name
      last_name
      phone_number
      email
      role
    }
  }
`
