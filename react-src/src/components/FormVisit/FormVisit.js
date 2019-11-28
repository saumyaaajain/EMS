import React, { Component } from 'react'
import { Message, Button, Form, Select } from 'semantic-ui-react'
import axios from 'axios'

const statusOptions = [
  { key: 'meeting_created', text: 'Meeting Created', value: 'meeting_created' },
  { key: 'meeting_under_progress', text: 'Meeting Under Progress', value: 'meeting_under_progress' },
  { key: 'meeting_completed', text: 'Meeting Completed', value: 'meeting_completed' }
]

class FormVisit extends Component {
  constructor (props) {
    super(props)

    this.state = {
      host: {},
      visitor: {},
      status: '',
      address: '',
      formClassName: '',
      formSuccessMessage: '',
      formErrorMessage: ''
    }

    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSelectChange = this.handleSelectChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentWillMount () {
    // Fill in the form with the appropriate data if visit id is provided
    if (this.props.visitID) {
      axios.get(`${this.props.server}/api/visits/${this.props.visitID}`)
        .then((response) => {
          console.log(response)
          this.setState({
            host: response.data.host,
            visitor: response.data.visitor,
            status: response.data.status,
            address: response.data.address
          })
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }

  handleInputChange (e) {
    const target = e.target
    const value = target.type === 'checkbox' ? target.checked : target.value
    const name = target.name

    this.setState({ [name]: value })
  }

  handleSelectChange (e, data) {
    const {
      value,
      name
    } = data
    this.setState({ [name]: value })
  }

  handleSubmit (e) {
    // Prevent browser refresh
    e.preventDefault()

    const visit = {
      host: this.state.host,
      visitor: this.state.visitor,
      status: this.state.status,
      address: this.state.address
    }

    // Acknowledge that if the visit id is provided, we're updating via PUT
    // Otherwise, we're creating a new data via POST
    const method = this.props.visitID ? 'put' : 'post'
    const params = this.props.visitID ? this.props.visitID : ''

    axios({
      method: method,
      responseType: 'json',
      url: `${this.props.server}/api/visits/${params}`,
      data: visit
    })
      .then((response) => {
        this.setState({
          formClassName: 'success',
          formSuccessMessage: response.data.msg
        })

        if (!this.props.visitID) {
          this.setState({
            host: {},
            visitor: {},
            status: '',
            address: ''
          })
          this.props.onVisitAdded(response.data.result)
          this.props.socket.emit('add_visit', response.data.result)
        } else {
          this.props.onVisitUpdated(response.data.result)
          this.props.socket.emit('update_visit', response.data.result)
        }
      })
      .catch((err) => {
        if (err.response) {
          if (err.response.data) {
            this.setState({
              formClassName: 'warning',
              formErrorMessage: err.response.data.msg
            })
          }
        } else {
          this.setState({
            formClassName: 'warning',
            formErrorMessage: 'Something went wrong. ' + err
          })
        }
      })
  }

  render () {
    const formClassName = this.state.formClassName
    const formSuccessMessage = this.state.formSuccessMessage
    const formErrorMessage = this.state.formErrorMessage
    const userOptions = this.props.users.map((user, index) => {
      return { key: user._id, text: user.name, value: user._id }
    })

    return (
      <Form className={formClassName} onSubmit={this.handleSubmit}>
        <Form.Input
          label='Address'
          type='text'
          placeholder='Jaipur'
          name='address'
          maxLength='80'
          required
          value={this.state.address}
          onChange={this.handleInputChange}
        />
        <Form.Group widths='equal'>
          <Form.Field
            control={Select}
            label='Host'
            name='host'
            options={userOptions}
            placeholder='Host'
            required
            value={this.state.host._id || this.state.host}
            onChange={this.handleSelectChange}
          />
          <Form.Field
            control={Select}
            label='Visitor'
            name='visitor'
            options={userOptions}
            placeholder='Visitor'
            required
            value={this.state.visitor._id || this.state.visitor}
            onChange={this.handleSelectChange}
          />
          {this.state.status && <Form.Field
            control={Select}
            label='Status'
            name='status'
            options={statusOptions}
            placeholder='Status'
            value={this.state.status}
            onChange={this.handleSelectChange}
          />}
        </Form.Group>
        <Message
          success
          color='green'
          header='Nice one!'
          content={formSuccessMessage}
        />
        <Message
          warning
          color='yellow'
          header='Woah!'
          content={formErrorMessage}
        />
        <Button color={this.props.buttonColor} floated='right'>{this.props.buttonSubmitTitle}</Button>
        <br /><br /> {/* Yikes! Deal with Semantic UI React! */}
      </Form>
    )
  }
}

export default FormVisit
