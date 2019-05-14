import React from 'react';
import {connect} from 'react-redux';
import {Grid} from "semantic-ui-react";
import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';
import './App.css';

const App = ({currentUser, currentChannel}) => {
    return (
        <Grid columns="equal" className="app" style={{background: '#eee'}}>
            <ColorPanel/>
            <SidePanel key={currentUser && currentUser.uid} currentUser={currentUser}/>
            <Grid.Column className="app-in" style={{marginLeft: 320}}>
                <Messages currentChannel={currentChannel} currentUser={currentUser} key={currentChannel && currentChannel.id}/>
            </Grid.Column>
            <Grid.Column className="app-in" width={4}>
                <MetaPanel/>
            </Grid.Column>
        </Grid>
    );
};

const mapStateToProps = (state) => {
    return {
        currentUser: state.user.currentUser,
        currentChannel: state.channel.currentChannel
    };
};

export default connect(mapStateToProps)(App);
