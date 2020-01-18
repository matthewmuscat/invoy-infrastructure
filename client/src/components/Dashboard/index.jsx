// @flow

import React from "react"

import withSession from "../Session/withSession"

import { MessageCreate, Messages } from "../Message"

const Dashboard = ({ session }) => (
  <div>
    <h2>Invoices</h2>

    {session && session.me && <MessageCreate />}
    <Messages limit={2} />
  </div>
)

export default withSession(Dashboard)
