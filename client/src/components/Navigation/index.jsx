// @flow

import React from "react"
import { Link } from "react-router-dom"
import _ from "lodash"

import * as routes from "../../constants/routes"
import SignOutButton from "../SignOut"

const Navigation = ({ session }) => (
  <div>
    {session && session.me ? (
      <NavigationAuth session={session} />
    ) : (
      <NavigationNonAuth />
    )}
  </div>
)

const NavigationAuth = ({ session }) => (
  <ul>
    <li>
      <Link to={routes.LANDING}>Landing</Link>
    </li>
    <li>
      <Link to={routes.ACCOUNT}>Account ({_.concat(session.me.first_name, " ", session.me.last_name)})</Link>
    </li>
    {session &&
      session.me &&
      session.me.role === "ADMIN" && (
      <li>
        <Link to={routes.ADMIN}>Admin</Link>
      </li>
    )}
    <li>
      <SignOutButton />
    </li>
  </ul>
)

const NavigationNonAuth = () => (
  <ul>
    <li>
      <Link to={routes.SIGN_IN}>Sign In</Link>
    </li>
    <li>
      <Link to={routes.LANDING}>Landing</Link>
    </li>
  </ul>
)

export default Navigation
