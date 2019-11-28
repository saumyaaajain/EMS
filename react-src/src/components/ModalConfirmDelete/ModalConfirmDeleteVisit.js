import React, { Component } from 'react';
import { Button, Modal } from 'semantic-ui-react';
import axios from 'axios';

class ModalConfirmDeleteVisit extends Component {

  constructor(props) {
    super(props);

    this.state ={
      modalOpen: false
    }

    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleOpen = e => this.setState({ modalOpen: true });
  handleClose = e => this.setState({ modalOpen: false });

  handleSubmit(e) {

    let params = e.target.getAttribute('data-visitID');

    axios({
      method: 'delete',
      responseType: 'json',
      url: `${this.props.server}/api/visits/${params}`,
    })
    .then((response) => {
      this.handleClose();
      this.props.onVisitDeleted(response.data.result);
      this.props.socket.emit('delete_visit', response.data.result);
    })
    .catch((err) => {
      this.handleClose();
      throw err;
    });
  }

  render() {
    return (
      <Modal
        trigger={<Button onClick={this.handleOpen} color={this.props.buttonColor}>{this.props.buttonTriggerTitle}</Button>}
        open={this.state.modalOpen}
        onClose={this.handleClose}
        dimmer='inverted'
        size='tiny'
      >
        <Modal.Header>{this.props.headerTitle}</Modal.Header>
        <Modal.Content>
          <p>Are you sure you want to delete <strong>{this.props.visit.address}</strong> hosted by {this.props.visit.host.name}?</p>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.handleSubmit} data-visitID={this.props.visit._id} color='red'>Yes</Button>
          <Button onClick={this.handleClose} color='black'>No</Button>
          </Modal.Actions>
      </Modal>
    );
  }
}

export default ModalConfirmDeleteVisit;
