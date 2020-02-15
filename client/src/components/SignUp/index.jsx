// @flow

import React, { Component } from "react"
import { Link, withRouter } from "react-router-dom"
import { Mutation } from "react-apollo"
import { SIGN_UP_MUTATION } from "../../graphql/mutations"
import * as routes from "../../constants/routes"
import ErrorMessage from "../Error/index.jsx"
import styles from "./styles.module.scss"

const INITIAL_STATE = {
  first_name: "",
  last_name: "",
  phone_number: "",
  dob: {
    day: "",
    month: "",
    year: "",
  },
  email: "",
  password: "",
  passwordConfirmation: "",
}

const SignUpPage = ({ history, refetch }) => (
  <div>
    <h1>Register</h1>
    <SignUpForm history={history} refetch={refetch} />
  </div>
)

class SignUpForm extends Component {
  state = { ...INITIAL_STATE };

  onChange = (event) => {
    const { name, value } = event.target
    this.setState({ [name]: value })
  };
  
  updateObjectTextfield = (e, substitute) => {
    const { name, id, value } = e.target
    this.setState(prevState => ({
      [id || substitute]: {
        ...prevState[id || substitute],
        [name]: value,
      },
    }))
  }

  onSubmit = (event, signUp) => {
    signUp().then(async ({ data }) => {
      localStorage.setItem("token", data.signUp.token)

      await this.props.refetch()

      this.props.history.push(routes.DASHBOARD)
    })

    event.preventDefault()
  };

  render() {
    const { first_name, last_name, phone_number, dob, email, password, passwordConfirmation } = this.state

    const isInvalid =
      password !== passwordConfirmation ||
      password === "" ||
      email === "" ||
      first_name === "" ||
      last_name === "" ||
      phone_number === "" ||
      dob === {}

    const parsedDob = new Date(Number(dob.year), Number(dob.month), Number(dob.day))

    return (
      <Mutation
        mutation={SIGN_UP_MUTATION}
        variables={{ first_name, last_name, phone_number, dob: parsedDob, email, password }}
      >
        {(signUp, { data, loading, error }) => (
          <form className={styles.formSection} onSubmit={event => this.onSubmit(event, signUp)}>
            <h4>Personal Details</h4>
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
              id="dob"
              name="day"
              onChange={e => this.updateObjectTextfield(e)}
              placeholder="Date of Birth (Day)"
              type="number"
              value={dob.day}
            />
            <input
              id="dob"
              name="month"
              onChange={e => this.updateObjectTextfield(e)}
              placeholder="Date of Birth (Month)"
              type="number"
              value={dob.month}
            />
            <input
              id="dob"
              name="year"
              onChange={e => this.updateObjectTextfield(e)}
              placeholder="Date of Birth (Year)"
              type="number"
              value={dob.year}
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
              Register
            </button>

            <div>
              <p>By registering, you agree to Stripe's <a href="https://stripe.com/legal">Services Agreement</a> and the <a href="https://stripe.com/connect-account/legal">Stripe Connected Account Agreement.</a></p>
            </div>

            {error && <ErrorMessage error={error} />}
          </form>
        )}
      </Mutation>
    )
  }
}

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={routes.SIGN_UP}>Register</Link>
  </p>
)

export default withRouter(SignUpPage)

export { SignUpForm, SignUpLink }
