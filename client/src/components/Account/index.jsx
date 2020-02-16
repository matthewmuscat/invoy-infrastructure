// @flow
import React, { Component } from "react"
import { Mutation } from "react-apollo"
import withAuthorization from "../Session/withAuthorization"
import { CREATE_VERIFICATION_MUTATION } from "../../graphql/mutations"
import ErrorMessage from "../Error/index.jsx"

type State = {
  disabled: boolean,
  files: Array<string>,
}

class AccountPage extends Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = {
      files: [],
      disabled: true,
    }
  }

  handleChangeFile = (event) => {
    const { files } = this.state 
    const uploadedFile = event.target.files[0]
    const formData = new FormData()
    formData.append("file", uploadedFile)
    const returnedFormData = formData.get("file")

    if (returnedFormData != "undefined") {
      this.setState({ files: [...files, returnedFormData] }, () => {
        if (files.length === 1) {
          this.setState({ disabled: false })
        }
      })
    } else {
      this.setState({ disabled: true })
    }
  
    //Make a request to server and send formData
  }

  handleUpload = async (event, createVerification) => {
    event.preventDefault()

    try {
      await createVerification()
    } catch (error) {
      console.log(error)
    }
  };

  render() {
    const { disabled, files } = this.state
    const formattedFiles = files.map(f => ({
      name: f.name,
      lastModified: f.lastModified,
      lastModifiedDate: f.lastModifiedDate,
      webkitRelativePath: f.webkitRelativePath,
      size: f.size,
      type: f.type,
    }))

    return (
      <Mutation
        mutation={CREATE_VERIFICATION_MUTATION}
        variables={{ files: formattedFiles }}
      >
        {(createVerification, { data, loading, error }) => (
          <div>
            <h1>Account Page</h1>
        
            <div>
              <h2>Verification (required)</h2>
              <p>Please upload a document showing your address, either a passport, driver's license, or utility-bill
                from a well known company.
              </p>

              <form onSubmit={event => this.handleUpload(event, createVerification)}>
                <input id={"front"} onChange={e => this.handleChangeFile(e)} type="file" /><br /><br />

                <input id={"back"} onChange={e => this.handleChangeFile(e)} type="file" /><br /><br />


                <button disabled={disabled} type="submit">Upload File</button>

                {error && <ErrorMessage error={error} />}
              </form>
            </div>

          </div>
        )}
      </Mutation>
    )
  }
}

export default withAuthorization(session => session && session.me)(
  AccountPage
)