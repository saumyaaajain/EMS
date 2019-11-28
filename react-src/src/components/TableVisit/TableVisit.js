import React, { Component } from 'react'
import { Table } from 'semantic-ui-react'
import ModalVisit from '../ModalVisit/ModalVisit'
import ModalConfirmDeleteVisit from '../ModalConfirmDelete/ModalConfirmDeleteVisit'

const moment = require('moment')

class TableVisit extends Component {
  render () {
    let visits = this.props.visits

    visits = visits.map((visit) =>
      <Table.Row key={visit._id}>
        <Table.Cell>{visit.address}</Table.Cell>
        <Table.Cell>{visit.host.name}</Table.Cell>
        <Table.Cell>{visit.visitor.name}</Table.Cell>
        <Table.Cell className='capitalize'>{visit.status.split('_').join(' ')}</Table.Cell>
        <Table.Cell>{moment(visit.updatedAt).format('MMMM Do YYYY, h:mm:ss a')}</Table.Cell>
        <Table.Cell>
          <ModalVisit
            headerTitle='Edit Visit'
            buttonTriggerTitle='Edit'
            buttonSubmitTitle='Save'
            buttonColor='blue'
            users={this.props.users}
            visitID={visit._id}
            onVisitUpdated={this.props.onVisitUpdated}
            server={this.props.server}
            socket={this.props.socket}
          />
          <ModalConfirmDeleteVisit
            headerTitle='Delete Visit'
            buttonTriggerTitle='Delete'
            buttonColor='black'
            visit={visit}
            onVisitDeleted={this.props.onVisitDeleted}
            server={this.props.server}
            socket={this.props.socket}
          />
        </Table.Cell>
      </Table.Row>
    )

    // Make every new visit appear on top of the list
    visits = [...visits].reverse()

    return (
      <Table singleLine>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Address</Table.HeaderCell>
            <Table.HeaderCell>Host Name</Table.HeaderCell>
            <Table.HeaderCell>Visitor Name</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Last Update At</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {visits}
        </Table.Body>
      </Table>
    )
  }
}

export default TableVisit
