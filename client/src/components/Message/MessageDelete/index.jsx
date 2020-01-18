// @flow

import React from "react"
import { Mutation } from "react-apollo"
import { DELETE_MESSAGE_MUTATION } from "../../../graphql/mutations"
import { GET_ALL_MESSAGES_WITH_USERS_QUERY } from "../../../graphql/queries"

type Message = {|
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

const MessageDelete = ({ message }: Message) => (
  <Mutation
    mutation={DELETE_MESSAGE_MUTATION}
    update={(cache) => {
      const data = cache.readQuery({ query: GET_ALL_MESSAGES_WITH_USERS_QUERY })
      console.log("Message", message)
      cache.writeQuery({
        query: GET_ALL_MESSAGES_WITH_USERS_QUERY,
        data: {
          ...data,
          messages: {
            ...data.messages,
            edges: data.messages.edges.filter(
              node => node.id !== message.id
            ),
            pageInfo: data.messages.pageInfo,
          },
        },
      })
    }}
    variables={{ id: message.id }}
  >
    {(deleteMessage, { data, loading, error }) => (
      <button onClick={deleteMessage} type="button">
        Delete
      </button>
    )}
  </Mutation>
)

export default MessageDelete
