// @flow

import React, { Component } from "react"
import { Link, withRouter } from "react-router-dom"
import { Mutation } from "react-apollo"
import gql from "graphql-tag"

import * as routes from "../../constants/routes"
import ErrorMessage from "../Error/"

const SIGN_UP = gql`
  mutation($email: String!, $first_name: String!, $last_name: String!, $phone_number: String!, $password: String!) {
    signUp(email: $email, first_name: $first_name, last_name: $last_name, phone_number: $phone_number, password: $password) {
      token
    }
  }
`

const INITIAL_STATE = {
  first_name: "",
  last_name: "",
  phone_number: "",
  email: "",
  password: "",
  passwordConfirmation: "",
}

const SignUpPage = ({ history, refetch }) => (
  <div>
    <h1>SignUp</h1>
    <SignUpForm history={history} refetch={refetch} />
  </div>
)

class SignUpForm extends Component {
  state = { ...INITIAL_STATE };

  onChange = (event) => {
    const { name, value } = event.target
    this.setState({ [name]: value })
  };

  onSubmit = (event, signUp) => {
    signUp().then(async ({ data }) => {
      localStorage.setItem("token", data.signUp.token)

      await this.props.refetch()

      this.props.history.push(routes.LANDING)
    })

    event.preventDefault()
  };

  render() {
    const {
      first_name,
      last_name,
      phone_number,
      email,
      password,
      passwordConfirmation,
    } = this.state

    const isInvalid =
      password !== passwordConfirmation ||
      password === "" ||
      email === "" ||
      first_name === "" ||
      last_name === "" ||
      phone_number === ""

    return (
      <Mutation
        mutation={SIGN_UP}
        variables={{ first_name, last_name, phone_number, email, password }}
      >
        {(signUp, { data, loading, error }) => (
          <form onSubmit={event => this.onSubmit(event, signUp)}>
            <input
              name="first_name"
              onChange={this.onChange}
              placeholder="First Name"
              type="text"
              value={first_name}
            />
            <input
              name="last_name"
              onChange={this.onChange}
              placeholder="Last Name"
              type="text"
              value={last_name}
            />
            <input
              name="phone_number"
              onChange={this.onChange}
              placeholder="Phone Number"
              type="text"
              value={phone_number}
            />
            <input
              name="email"
              onChange={this.onChange}
              placeholder="Email"
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
            <input
              name="passwordConfirmation"
              onChange={this.onChange}
              placeholder="Confirm Password"
              type="password"
              value={passwordConfirmation}
            />
            <button disabled={isInvalid || loading} type="submit">
              Sign Up
            </button>

            {error && <ErrorMessage error={error} />}
          </form>
        )}
      </Mutation>
    )
  }
}

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={routes.SIGN_UP}>Sign Up</Link>
  </p>
)

export default withRouter(SignUpPage)

export { SignUpForm, SignUpLink }
