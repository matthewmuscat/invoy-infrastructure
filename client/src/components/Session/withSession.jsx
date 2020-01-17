// @flow

import React from "react"
import { Query } from "react-apollo"
import { GET_ME } from "./queries"

const withSession = Component => props => (
  <Query query={GET_ME}>
    {({ data, refetch }) => (
      <Component {...props} refetch={refetch} session={data} />
    )}
  </Query>
)

export default withSession
