// @flow

import React from "react"
import { Router, Route } from "react-router-dom"

import Navigation from "../Navigation"
import Dashboard from "../Dashboard"
import SignUpPage from "../SignUp"
import SignInPage from "../SignIn"
import AccountPage from "../Account"
import AdminPage from "../Admin"
import withSession from "../Session/withSession"

import * as routes from "../../constants/routes"
import history from "../../constants/history"

const App = ({ session, refetch }) => (
  <Router history={history}>
    <div>
      <Navigation session={session} />

      <hr />

      <Route
        component={() => <Dashboard />}
        exact
        path={routes.DASHBOARD}
      />
      <Route
        component={() => <SignUpPage refetch={refetch} />}
        exact
        path={routes.SIGN_UP}
      />
      <Route
        component={() => <SignInPage refetch={refetch} />}
        exact
        path={routes.SIGN_IN}
      />
      <Route
        component={() => <AccountPage />}
        exact
        path={routes.ACCOUNT}
      />
      <Route
        component={() => <AdminPage />}
        exact
        path={routes.ADMIN}
      />
    </div>
  </Router>
)

export default withSession(App)
