// @flow

import React from "react"

import withSession from "../Session/withSession"

import { InvoiceCreate, Invoices } from "../Invoice"

const Dashboard = ({ session }) => (
  <div>
    <h2>Invoices</h2>

    {session && session.me && <InvoiceCreate />}
    <Invoices limit={10} />
  </div>
)

export default withSession(Dashboard)
