import React, {Component} from 'react';
import uuidv4 from 'uuid/v4';
import {Picker, emojiIndex} from "emoji-mart";
import 'emoji-mart/css/emoji-mart.css';
import firebase from '../../firebase';
import {Segment, Button, Input} from "semantic-ui-react";
import FileModal from './FileModal';
import ProgressBar from './ProgressBar';

class MessageForm extends Component {
    state = {
        storageRef: firebase.storage().ref(),
        typingRef: firebase.database().ref('typing'),
        uploadState: '',
        percentUploaded: 0,
        uploadTask: null,
        message: '',
        loading: false,
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        errors: [],
        modal: false,
        emojiPicker: false
    };

    componentWillUnmount() {
        if (this.state.uploadTask !== null) {
            this.state.uploadTask.cancel();
            this.setState({uploadTask: null});
        }
    }

    openModal = () => this.setState({modal: true});
    closeModal = () => this.setState({modal: false});

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    sendMessage = () => {
        const {getMessagesRef} = this.props;
        const {message, channel, typingRef, user} = this.state;

        if (message) {
            this.setState({
                loading: true
            });
            getMessagesRef().child(channel.id).push().set(this.createMessage()).then(() => {
                this.setState({
                    loading: false,
                    message: '',
                    errors: []
                });
                typingRef.child(channel.id).child(user.uid).remove();
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

    getPath = () => {
        if (this.props.isPrivateChannel) {
            return `chat/private/${this.state.channel.id}`;
        } else {
            return 'chat/public';
        }
    };

    uploadFile = (file, metadata) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessagesRef();
        const filePath = `${this.getPath()}/${uuidv4()}.jpg`;
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

    handleKeyDown = (e) => {
        if (e.keyCode === 13) {
            this.sendMessage();
        }
        const {message, typingRef, channel, user} = this.state;
        if (message) {
            typingRef.child(channel.id).child(user.uid).set(user.displayName);
        } else {
            typingRef.child(channel.id).child(user.uid).remove();
        }
    };

    handleTogglePicker = () => {
        this.setState({
           emojiPicker: !this.state.emojiPicker
        });
    };

    handleAddEmoji = (emoji) => {
        const oldMessage = this.state.message;
        const newMessage = this.colonToUnicode(` ${oldMessage} ${emoji.colons} `);
        this.setState({
            message: newMessage,
            emojiPicker: false
        });
        setTimeout(() => this.messageInputRef.focus(), 0);
    };

    colonToUnicode = (message) => {
        return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
            x = x.replace(/:/g, "");
            let emoji = emojiIndex.emojis[x];
            if (typeof emoji !== 'undefined') {
                let unicode = emoji.native;
                if (typeof unicode !== 'undefined') {
                    return unicode;
                }
            }
            x = ":" + x + ":";
            return x;
        });
    };

    render() {
        const {errors, message, loading, modal, uploadState, percentUploaded, emojiPicker} = this.state;
        return (
            <Segment className="message__form">
                {emojiPicker && (
                    <Picker onSelect={this.handleAddEmoji} set="apple" className="emojipicker" title="Pick your emoji" emoji="point_up"/>
                )}
                <Input ref={node => (this.messageInputRef = node)} onKeyDown={this.handleKeyDown} value={message} onChange={this.handleChange} fluid name="message" style={{marginBottom: '0.7em'}}
                       label={<Button content={emojiPicker ? 'Close' : null} icon={emojiPicker ? 'close' : 'add'} onClick={this.handleTogglePicker}/>} labelPosition="left" placeholder="Write your message"
                       className={errors.some(err => err.message.includes('message')) ? 'error' : ''}
                />
                <Button.Group icon widths="2">
                    <Button onClick={this.sendMessage} disabled={loading} color="orange" content="Add Reply"
                            labelPosition="left"
                            icon="edit"/>
                    <Button onClick={this.openModal} disabled={uploadState === 'uploading'} color="teal"
                            content="Upload Media" labelPosition="right"
                            icon="cloud upload"/>
                </Button.Group>
                <FileModal uploadFile={this.uploadFile} modal={modal} closeModal={this.closeModal}/>
                <ProgressBar uploadState={uploadState} percentUploaded={percentUploaded}/>
            </Segment>
        );
    }
}

export default MessageForm;