import React, { Component } from 'react'
import { Divider, Grid, Message, Table} from 'semantic-ui-react'
import axios from 'axios'
import io from 'socket.io-client'

import TableUser from '../TableUser/TableUser'
import ModalUser from '../ModalUser/ModalUser'
import ModalVisit from '../ModalVisit/ModalVisit'

import './App.css'
import TableVisit from '../TableVisit/TableVisit'

class App extends Component {
  constructor () {
    super()

    this.server = process.env.REACT_APP_API_URL || ''
    this.socket = io.connect(this.server)

    this.state = {
      users: [],
      visits: [],
      online: 0
    }

    this.fetchUsers = this.fetchUsers.bind(this)
    this.fetchVisits = this.fetchVisits.bind(this)
    this.handleUserAdded = this.handleUserAdded.bind(this)
    this.handleVisitAdded = this.handleVisitAdded.bind(this)
    this.handleUserUpdated = this.handleUserUpdated.bind(this)
    this.handleVisitUpdated = this.handleVisitUpdated.bind(this)
    this.handleUserDeleted = this.handleUserDeleted.bind(this)
    this.handleVisitDeleted = this.handleVisitDeleted.bind(this)
  }

  // Place socket.io code inside here
  componentDidMount () {
    this.fetchUsers()
    this.fetchVisits()

    this.socket.on('visitor enters', data => this.setState({ online: data }))
    this.socket.on('visitor exits', data => this.setState({ online: data }))

    this.socket.on('add', data => this.handleUserAdded(data))
    this.socket.on('update', data => this.handleUserUpdated(data))
    this.socket.on('delete', data => this.handleUserDeleted(data))

    this.socket.on('add_visit', data => this.handleVisitAdded(data))
    this.socket.on('update_visit', data => this.handleVisitUpdated(data))
    this.socket.on('delete_visit', data => this.handleVisitDeleted(data))
  }

  // Fetch data from the back-end
  fetchUsers () {
    axios.get(`${this.server}/api/users/`)
      .then((response) => {
        this.setState({ users: response.data })
      })
      .catch((err) => {
        console.log(err)
      })
  }

  fetchVisits () {
    axios.get(`${this.server}/api/visits/`)
      .then((response) => {
        this.setState({ visits: response.data })
      })
      .catch((err) => {
        console.log(err)
      })
  }

  handleUserAdded (user) {
    const users = this.state.users.slice()
    users.push(user)
    this.setState({ users: users })
  }

  handleVisitAdded (visit) {
    const visits = this.state.visits.slice()
    visits.push(visit)
    this.setState({ visits: visits })
  }

  handleUserUpdated (user) {
    const users = this.state.users.slice()
    for (let i = 0, n = users.length; i < n; i++) {
      if (users[i]._id === user._id) {
        users[i].name = user.name
        users[i].email = user.email
        users[i].age = user.age
        users[i].phone = user.phone
        users[i].gender = user.gender
        break // Stop this loop, we found it!
      }
    }
    this.setState({ users: users })
  }

  handleVisitUpdated (visit) {
    console.log('called', visit)
    const visits = this.state.visits.slice()
    for (let i = 0, n = visits.length; i < n; i++) {
      if (visits[i]._id === visit._id) {
        visits[i].host = visit.host
        visits[i].visitor = visit.visitor
        visits[i].status = visit.status
        visits[i].address = visit.address
        break // Stop this loop, we found it!
      }
    }
    this.setState({ visits: visits })
  }

  handleUserDeleted (user) {
    let users = this.state.users.slice()
    users = users.filter(u => { return u._id !== user._id })
    this.setState({ users: users })
  }

  handleVisitDeleted (visit) {
    let visits = this.state.visits.slice()
    visits = visits.filter(u => { return u._id !== visit._id })
    this.setState({ visits: visits })
  }

  render () {
    const online = this.state.online
    const verb = (online <= 1) ? 'is' : 'are' // linking verb, if you'd prefer
    const noun = (online <= 1) ? 'person' : 'people'

    return (
      <div>
        <div className='App'>
          <div className='App-header'>
            <h1>
              Entry Management Software
            </h1>
          </div>
        </div>
        <Grid textAlign='center' verticalAlign='middle'>
          <Grid.Row style={{ maxWidth: 550 }}>
          <ModalUser
              headerTitle='Add User'
              buttonTriggerTitle='Add User'
              buttonSubmitTitle='Add User'
              buttonColor='green'
              onUserAdded={this.handleUserAdded}
              server={this.server}
              socket={this.socket}
          />
          <ModalVisit
              headerTitle='Create Meeting'
              buttonTriggerTitle='Create Meeting'
              buttonSubmitTitle='Add'
              buttonColor='green'
              onVisitAdded={this.handleVisitAdded}
              users={this.state.users}
              server={this.server}
              socket={this.socket}
          />
          </Grid.Row>
        </Grid>
        <Divider section />
        <div className='padding'>
          <Message attached content='Users Info' icon='address book' info />
          <Table attached='bottom'>
            <TableUser
                onUserUpdated={this.handleUserUpdated}
                onUserDeleted={this.handleUserDeleted}
                users={this.state.users}
                server={this.server}
                socket={this.socket}
            />
          </Table>
          <Divider section />

          <Message attached='top' content='Ongoing/Yet to begin Meetings Info' icon='calendar alternate outline' info />
          <Table attached>
            <TableVisit
                onVisitUpdated={this.handleVisitUpdated}
                onVisitDeleted={this.handleVisitDeleted}
                users={this.state.users}
                visits={this.state.visits}
                server={this.server}
                socket={this.socket}
            />
          </Table>
        </div>
        <Divider section />
      </div>
    )
  }
}

export default App
