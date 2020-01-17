// @flow

import React from "react"
import { ApolloConsumer } from "react-apollo"

import * as routes from "../../constants/routes"
import history from "../../constants/history"

const SignOutButton = () => (
  <ApolloConsumer>
    {client => (
      <button onClick={() => signOut(client)} type="button">
        Sign Out
      </button>
    )}
  </ApolloConsumer>
)

const signOut = (client) => {
  localStorage.removeItem("token")
  client.resetStore()
  history.push(routes.SIGN_IN)
}

export { signOut }

export default SignOutButton
