// @flow

import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import { Mutation } from "react-apollo"
import { SIGN_IN_MUTATION } from "../../graphql/mutations"
import { SignUpLink } from "../SignUp"
import * as routes from "../../constants/routes"
import ErrorMessage from "../Error"

const SignInPage = ({ history, refetch }) => (
  <div>
    <h1>Log In</h1>
    <SignInForm history={history} refetch={refetch} />
    <SignUpLink />
  </div>
)

const INITIAL_STATE = {
  email: "",
  password: "",
}

class SignInForm extends Component {
  state = { ...INITIAL_STATE };

  onChange = (event) => {
    const { name, value } = event.target
    this.setState({ [name]: value })
  };

  onSubmit = (event, signIn) => {
    signIn().then(async ({ data }) => {
      this.setState({ ...INITIAL_STATE })

      localStorage.setItem("token", data.signIn.token)

      await this.props.refetch()

      this.props.history.push(routes.DASHBOARD)
    })

    event.preventDefault()
  };

  render() {
    const { email, password } = this.state

    const isInvalid = password === "" || email === ""

    return (
      <Mutation mutation={SIGN_IN_MUTATION} variables={{ email, password }}>
        {(signIn, { data, loading, error }) => (
          <form onSubmit={event => this.onSubmit(event, signIn)}>
            <input
              name="email"
              onChange={this.onChange}
              placeholder="Email or email"
              type="text"
              value={email}
            />
            <input
              name="password"
              onChange={this.onChange}
              placeholder="Password"
              type="password"
              value={password}
            />
            <button disabled={isInvalid || loading} type="submit">
              Log In
            </button>

            {error && <ErrorMessage error={error} />}
          </form>
        )}
      </Mutation>
    )
  }
}

export default withRouter(SignInPage)

export { SignInForm }
