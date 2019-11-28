import React, { Component } from 'react'
import { Button, Modal } from 'semantic-ui-react'

import FormVisit from '../FormVisit/FormVisit'

class ModalVisit extends Component {
  render () {
    return (
      <Modal
        trigger={<Button color={this.props.buttonColor}>{this.props.buttonTriggerTitle}</Button>}
        dimmer='inverted'
        size='small'
        closeIcon='close'
      >
        <Modal.Header>{this.props.headerTitle}</Modal.Header>
        <Modal.Content>
          <FormVisit
            buttonSubmitTitle={this.props.buttonSubmitTitle}
            buttonColor={this.props.buttonColor}
            visitID={this.props.visitID}
            onVisitAdded={this.props.onVisitAdded}
            onVisitUpdated={this.props.onVisitUpdated}
            server={this.props.server}
            socket={this.props.socket}
            users={this.props.users}
          />
        </Modal.Content>
      </Modal>
    )
  }
}

export default ModalVisit
