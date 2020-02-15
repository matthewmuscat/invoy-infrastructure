// @flow
import React, { Component } from "react"
import { Mutation } from "react-apollo"
import { CREATE_INVOICE_MUTATION } from "../../../graphql/mutations"

import ErrorMessage from "../../Error/index.jsx"

class InvoiceCreate extends Component {
  state = { text: "" };

  onChange = (event) => {
    const { name, value } = event.target
    this.setState({ [name]: value })
  };

  onSubmit = async (event, createInvoice) => {
    event.preventDefault()

    try {
      await createInvoice()
      this.setState({ text: "" })
    } catch (error) {
      console.log(error)
    }
  };

  render() {
    const { text } = this.state

    return (
      <Mutation
        mutation={CREATE_INVOICE_MUTATION}
        variables={{ text }}
        // Not used anymore because of Subscription

        // update={(cache, { data: { createInvoice } }) => {
        //   const data = cache.readQuery({
        //     query: GET_ALL_MESSAGES_WITH_USERS,
        //   });

        //   cache.writeQuery({
        //     query: GET_ALL_MESSAGES_WITH_USERS,
        //     data: {
        //       ...data,
        //       messages: {
        //         ...data.messages,
        //         edges: [createInvoice, ...data.messages.edges],
        //         pageInfo: data.messages.pageInfo,
        //       },
        //     },
        //   });
        // }}
      >
        {(createInvoice, { data, loading, error }) => (
          <form
            onSubmit={event => this.onSubmit(event, createInvoice)}
          >
            <textarea
              name="text"
              onChange={this.onChange}
              placeholder="Your message ..."
              type="text"
              value={text}
            />
            <button type="submit">Send</button>

            {error && <ErrorMessage error={error} />}
          </form>
        )}
      </Mutation>
    )
  }
}

export default InvoiceCreate
