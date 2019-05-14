import React, {Component} from 'react';
import firebase from '../../firebase';
import {Segment, Comment} from "semantic-ui-react";
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';

class Messages extends Component {
    state = {
        messagesRef: firebase.database().ref('messages'),
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        messages: [],
        messagesLoading: true,
        numUniqueUsers: '',
        searchTerm: '',
        searchLoading: false,
        searchResults: []
    };

    componentDidMount() {
        const {channel, user} = this.state;
        if (channel && user) {
            this.addListeners(channel.id);
        }
    }

    addListeners = (channelId) => {
        this.addMessageListener(channelId);
    };

    addMessageListener = (channelId) => {
        let loadedMessages = [];
        this.state.messagesRef.child(channelId).on('child_added', snap => {
            loadedMessages.push(snap.val());
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            });
            this.countUniqueUsers(loadedMessages);
        });
    };

    countUniqueUsers = (messages) => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if (!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
        const numUniqueUsers = `${uniqueUsers.length} user${plural ? 's' : ''}`;
        this.setState({numUniqueUsers});
    };

    displayMessages = (messages) => {
        return (
            messages.length > 0 && messages.map(message => {
                return <Message key={message.timestamp} message={message} user={this.state.user}/>
            })
        );
    };

    displayChannelName = (channel) => {
        return channel ? `${channel.name}` : '';
    };

    handleSearchChange = e => {
        this.setState({
            searchTerm: e.target.value,
            searchLoading: true
        }, () => this.handleSearchMessages());
    };

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, 'gi');
        const searchResults = channelMessages.reduce((acc, message) => {
            if ((message.content && message.content.match(regex)) || message.user.name.match(regex)) {
                acc.push(message);
            }
            return acc;
        }, []);
        this.setState({searchResults});
        setTimeout(() => this.setState({searchLoading: false}), 1000);
    };

    render() {
        const {messagesRef, channel, user, messages, numUniqueUsers, searchTerm, searchResults, searchLoading} = this.state;
        return (
            <React.Fragment>
                <MessagesHeader searchLoading={searchLoading} handleSearchChange={this.handleSearchChange} channelName={this.displayChannelName(channel)} numUniqueUsers={numUniqueUsers}/>
                <Segment>
                    <Comment.Group className="messages">
                        {searchTerm ? this.displayMessages(searchResults) : this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>
                <MessageForm messagesRef={messagesRef} currentChannel={channel} currentUser={user}/>
            </React.Fragment>
        );
    }
}

export default Messages;