import axios from "axios"

const API_URL = "http://localhost:8000/graphql"

export const signIn = async variables =>
  await axios.post(API_URL, {
    query: `
      mutation ($email: String!, $password: String!) {
        signIn(email: $email, password: $password) {
          token
        }
      }
    `,
    variables,
  })

export const me = async token =>
  await axios.post(
    API_URL,
    {
      query: `
        {
          me {
            id
            email
          }
        }
      `,
    },
    token
      ? { headers: { "x-token": token } }
      : null
  )

export const user = async variables =>
  axios.post(API_URL, {
    query: `
      query ($id: ID!) {
        user(id: $id) {
          id
          email
          role
        }
      }
    `,
    variables,
  })

export const users = async () =>
  axios.post(API_URL, {
    query: `
      {
        users {
          id
          email
          role
        }
      }
    `,
  })

export const createUser = async variables =>
  axios.post(API_URL, {
    query: `
      mutation(
        $email: String!,
        $password: String!
      ) {
        createUser(
          email: $email,
          password: $password
        ) {
          token
        }
      }
    `,
    variables,
  })

export const updateUser = async (variables, token) =>
  axios.post(
    API_URL,
    {
      query: `
        mutation ($email: String!) {
          updateUser(email: $email) {
            email
          }
        }
      `,
      variables,
    },
    token
      ? { headers: { "x-token": token } }
      : null
  )

export const deleteUser = async (variables, token) =>
  axios.post(
    API_URL,
    {
      query: `
        mutation ($id: ID!) {
          deleteUser(id: $id)
        }
      `,
      variables,
    },
    token
      ? { headers: { "x-token": token } }
      : null
  )
