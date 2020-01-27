// @flow

import React from "react"
import { Mutation } from "react-apollo"
import { DELETE_INVOICE_MUTATION } from "../../../graphql/mutations"
import { GET_ALL_INVOICES_WITH_USERS_QUERY } from "../../../graphql/queries"

type Invoice = {|
  createdAt: string,
  id: string,
  text: string,
  user: {
    email: string,
    first_name: string,
    id: string,
    last_name: string,
  },
|}

const InvoiceDelete = ({ invoice }: Invoice) => (
  <Mutation
    mutation={DELETE_INVOICE_MUTATION}
    update={(cache) => {
      const data = cache.readQuery({ query: GET_ALL_INVOICES_WITH_USERS_QUERY })
      console.log("Invoice", invoice)
      cache.writeQuery({
        query: GET_ALL_INVOICES_WITH_USERS_QUERY,
        data: {
          ...data,
          invoices: {
            ...data.invoices,
            edges: data.invoices.edges.filter(
              node => node.id !== invoice.id
            ),
            pageInfo: data.invoices.pageInfo,
          },
        },
      })
    }}
    variables={{ id: invoice.id }}
  >
    {(deleteInvoice, { data, loading, error }) => (
      <button onClick={deleteInvoice} type="button">
        Delete
      </button>
    )}
  </Mutation>
)

export default InvoiceDelete
