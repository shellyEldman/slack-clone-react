import React, {Component} from 'react';
import uuidv4 from 'uuid/v4';
import firebase from '../../firebase';
import {Segment, Button, Input} from "semantic-ui-react";
import FileModal from './FileModal';
import ProgressBar from './ProgressBar';

class MessageForm extends Component {
    state = {
        storageRef: firebase.storage().ref(),
        uploadState: '',
        percentUploaded: 0,
        uploadTask: null,
        message: '',
        loading: false,
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        errors: [],
        modal: false
    };

    openModal = () => this.setState({modal: true});
    closeModal = () => this.setState({modal: false});

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    sendMessage = () => {
        const {messagesRef} = this.props;
        const {message, channel} = this.state;

        if (message) {
            this.setState({
                loading: true
            });
            messagesRef.child(channel.id).push().set(this.createMessage()).then(() => {
                this.setState({
                    loading: false,
                    message: '',
                    errors: []
                });
            }).catch(err => {
                console.log('error:', err);
                this.setState({
                    loading: false,
                    errors: this.state.errors.concat(err)
                });
            });
        } else {
            this.setState({
                errors: this.state.errors.concat({message: 'Add a Message!'})
            });
        }
    };

    createMessage = (fileUrl = null) => {
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            }
        };

        if (fileUrl !== null) {
            message['image'] = fileUrl;
        } else {
            message['content'] = this.state.message;
        }
        return message;
    };

    uploadFile = (file, metadata) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.messagesRef;
        const filePath = `chat/public/${uuidv4()}.jpg`;
        this.setState({
            uploadState: 'uploading',
            uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
        }, () => {
            this.state.uploadTask.on('state_changed', snap => {
                    const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                    this.setState({percentUploaded});
                }, err => {
                    console.error('error', err);
                    this.setState({
                        errors: this.state.errors.concat(err),
                        uploadState: 'error',
                        uploadTask: null
                    });
                }, () => {
                    this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                        this.sendFileMessage(downloadURL, ref, pathToUpload);
                    }).catch(err => {
                        console.error('error', err);
                        this.setState({
                            errors: this.state.errors.concat(err),
                            uploadState: 'error',
                            uploadTask: null
                        });
                    });
                }
            );
        });
    };

    sendFileMessage = (downloadURL, ref, pathToUpload) => {
        ref.child(pathToUpload).push().set(this.createMessage(downloadURL)).then(() => {
            this.setState({
               uploadState: 'done'
            });
        }).catch(err => {
            console.error('error', err);
            this.setState({
                errors: this.state.errors.concat(err)
            });
        });
    };

    render() {
        const {errors, message, loading, modal, uploadState, percentUploaded} = this.state;
        return (
            <Segment className="message__form">
                <Input value={message} onChange={this.handleChange} fluid name="message" style={{marginBottom: '0.7em'}}
                       label={<Button icon="add"/>} labelPosition="left" placeholder="Write your message"
                       className={errors.some(err => err.message.includes('message')) ? 'error' : ''}
                />
                <Button.Group icon widths="2">
                    <Button onClick={this.sendMessage} disabled={loading} color="orange" content="Add Reply"
                            labelPosition="left"
                            icon="edit"/>
                    <Button onClick={this.openModal} disabled={uploadState === 'uploading'} color="teal" content="Upload Media" labelPosition="right"
                            icon="cloud upload"/>
                </Button.Group>
                <FileModal uploadFile={this.uploadFile} modal={modal} closeModal={this.closeModal}/>
                <ProgressBar uploadState={uploadState} percentUploaded={percentUploaded}/>
            </Segment>
        );
    }
}

export default MessageForm;