// @flow
import React, { Component, Fragment } from "react"
import { Query } from "react-apollo"
import gql from "graphql-tag"
import _ from "lodash"

import InvoiceDelete from "../InvoiceDelete"
import Loading from "../../Loading"
import withSession from "../../Session/withSession"

const INVOICE_CREATED = gql`
  subscription {
    invoiceCreated {
      invoice {
        id
        text
        createdAt
        user {
          id
          first_name
          last_name
          email
        }
      }
    }
  }
`

const GET_PAGINATED_INVOICES_WITH_USERS = gql`
  query($cursor: String, $limit: Int!) {
    invoices(cursor: $cursor, limit: $limit)
      @connection(key: "InvoicesConnection") {
      edges {
        id
        text
        createdAt
        user {
          id
          first_name
          last_name
          email
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

const Invoices = ({ limit }) => (
  <Query
    query={GET_PAGINATED_INVOICES_WITH_USERS}
    variables={{ limit }}
  >
    {({ data, loading, error, fetchMore, subscribeToMore }) => {
      if (!data) {
        return (
          <div>
            There are no invoices yet ... Try to create one by
            yourself.
          </div>
        )
      }

      const { invoices } = data

      if (loading || !invoices) {
        return <Loading />
      }

      const { edges, pageInfo } = invoices

      return (
        <Fragment>
          <InvoiceList
            invoices={edges}
            subscribeToMore={subscribeToMore}
          />

          {pageInfo.hasNextPage && (
            <MoreInvoicesButton
              fetchMore={fetchMore}
              limit={limit}
              pageInfo={pageInfo}
            >
              More
            </MoreInvoicesButton>
          )}
        </Fragment>
      )
    }}
  </Query>
)

const MoreInvoicesButton = ({
  limit,
  pageInfo,
  fetchMore,
  children,
}) => (
  <button
    onClick={() =>
      fetchMore({
        variables: {
          cursor: pageInfo.endCursor,
          limit,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previousResult
          }

          return {
            invoices: {
              ...fetchMoreResult.invoices,
              edges: [
                ...previousResult.invoices.edges,
                ...fetchMoreResult.invoices.edges,
              ],
            },
          }
        },
      })
    }
    type="button"
  >
    {children}
  </button>
)

class InvoiceList extends Component {
  componentDidMount() {
    this.subscribeToMoreInvoice()
  }
  subscribeToMoreInvoice = () => {
    this.props.subscribeToMore({
      document: INVOICE_CREATED,
      updateQuery: (previousResult, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return previousResult
        }

        const { invoiceCreated } = subscriptionData.data

        return {
          ...previousResult,
          invoices: {
            ...previousResult.invoices,
            edges: [
              invoiceCreated.invoice,
              ...previousResult.invoices.edges,
            ],
          },
        }
      },
    })
  };

  render() {
    const { invoices } = this.props

    return invoices.map(invoice => (
      <InvoiceItem invoice={invoice} key={invoice.id} />
    ))
  }
}

const InvoiceItemBase = ({ invoice, session }) => (
  <div>
    <h3>{_.concat(invoice.user.first_name, " ", invoice.user.last_name)}</h3>
    <small>{invoice.createdAt}</small>
    <p>{invoice.text}</p>

    {session && session.me && invoice.user.id === session.me.id && (
      <InvoiceDelete invoice={invoice} />
    )}
  </div>
)

const InvoiceItem = withSession(InvoiceItemBase)

export default Invoices
