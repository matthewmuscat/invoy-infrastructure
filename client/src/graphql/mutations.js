import gql from "graphql-tag"

export const SIGN_UP_MUTATION = gql`
  mutation($email: String!, $first_name: String!, $last_name: String!, $phone_number: String!, $password: String!) {
    signUp(email: $email, first_name: $first_name, last_name: $last_name, phone_number: $phone_number, password: $password) {
      token
    }
  }
`

export const SIGN_IN_MUTATION = gql`
  mutation($email: String!, $password: String!) {
    signIn(email: $email, password: $password) {
      token
    }
  }
`

export const CREATE_MESSAGE_MUTATION = gql`
  mutation($text: String!) {
    createMessage(text: $text) {
      id
      text
      createdAt
      user {
        id
        email
      }
    }
  }
`

export const DELETE_MESSAGE_MUTATION = gql`
  mutation($id: ID!) {
    deleteMessage(id: $id)
  }
`