// @flow
import React, { Component, Fragment } from "react"
import { Mutation } from "react-apollo"
import withAuthorization from "../Session/withAuthorization"
import { CREATE_VERIFICATION_MUTATION, UPLOAD_FILE_STREAM } from "../../graphql/mutations"
import ErrorMessage from "../Error/index.jsx"

type State = {
  attachedFiles: Array<File>,
  disabled: boolean,
}

class AccountPage extends Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = {
      attachedFiles: [],
      disabled: true,
    }
  }

  onChangeHandler = ({ target: { files } }) => {
    const { attachedFiles } = this.state
    
    const file = files[0]
    if (files) {
      this.setState({ attachedFiles: [...attachedFiles, file] }, () => {
        if (this.state.attachedFiles.length === 2) {
          this.setState({ disabled: false })
        }
      })
    } else {
      this.setState({ disabled: true })
    }
  }

  handleUpload = async (event, createVerification) => {
    event.preventDefault()

    const { attachedFiles } = this.state
    try {
      attachedFiles && await createVerification()
    } catch (error) {
      console.log(error)
    }
  };

  render() {
    const { disabled, attachedFiles } = this.state

    return (
      <div>
        <h1>Account Page</h1>

        <Mutation
          mutation={UPLOAD_FILE_STREAM}
          variables={{ files: attachedFiles }}
        >
          {(createVerification, { data, loading, error }) => (
            <div>
              <div>
                <h2>Verification (required)</h2>
                <p>Please upload a document showing your address, either a passport, driver's license, or utility-bill
                from a well known company.
                </p>

                <form encType={"multipart/form-data"} onSubmit={event => this.handleUpload(event, createVerification)}>
                  <input id={"front"} name={"document"} onChange={this.onChangeHandler} type="file" /><br /><br />
                  <input id={"back"} name={"document"} onChange={this.onChangeHandler} type="file" /><br /><br />

                  <button disabled={disabled} type="submit">Upload File</button>

                  {error && <ErrorMessage error={error} />}
                  {loading && <p>Loading...</p>}
                </form>
              </div>

            </div>
          )}
        </Mutation>

        
        <Mutation
          mutation={UPLOAD_FILE_STREAM}
          variables={{ files: attachedFiles }}
        >
          {(createVerification, { data, loading, error }) => (
            <div>
              <div>
                <h2>Bank Account (required)</h2>
                <p>Please connect your bank account that you wish to send and receive funds from.
                </p>

                <form encType={"multipart/form-data"} onSubmit={event => this.handleUpload(event, createVerification)}>
                  <input id={"front"} name={"document"} onChange={this.onChangeHandler} type="file" /><br /><br />
                  <input id={"back"} name={"document"} onChange={this.onChangeHandler} type="file" /><br /><br />

                  <button disabled={disabled} type="submit">Upload File</button>

                  {error && <ErrorMessage error={error} />}
                  {loading && <p>Loading...</p>}
                </form>
              </div>

            </div>
          )}
        </Mutation>
      </div>
    )
  }
}

export default withAuthorization(session => session && session.me)(
  AccountPage
)