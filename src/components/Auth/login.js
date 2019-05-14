import React, {Component} from 'react';
import {Grid, Form, Segment, Button, Header, Message, Icon} from "semantic-ui-react";
import {Link} from "react-router-dom";
import firebase from '../../firebase';

class Login extends Component {
    state = {
        email: '',
        password: '',
        errors: [],
        loading: false
    };

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    handleSubmit = (e) => {
        e.preventDefault();
        if (this.isFormValid(this.state)) {
            this.setState({errors: [], loading: true});
            firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(signInUser => {
                console.log('Signed In!', signInUser);
            }).catch(err => {
                console.error('error', err);
                this.setState({
                    errors: this.state.errors.concat(err),
                    loading: false
                });
            });
        }
    };

    isFormValid = ({email, password}) => email && password;

    displayErrors = (errors) => {
        return errors.map((err, i) => {
            return <p key={i}>{err.message}</p>;
        });
    };

    handleInputError = (errors, inputName) => {
        return errors.some(err => err.message.toLowerCase().includes(inputName)) ? 'error' : '';
    };

    render() {
        const {email, password, errors, loading} = this.state;

        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as="h1" icon color="violet" textAlign="center">
                        <Icon name="code branch" color="violet"/>
                        Login To Dev Chat
                    </Header>
                    <Form size="large" onSubmit={this.handleSubmit}>
                        <Segment stacked>
                            <Form.Input className={this.handleInputError(errors, 'email')} value={email} type="email"
                                        fluid name="email" icon="mail" iconPosition="left"
                                        placeholder="Email" onChange={this.handleChange}/>
                            <Form.Input className={this.handleInputError(errors, 'password')} value={password}
                                        type="password" fluid name="password" icon="lock"
                                        iconPosition="left" placeholder="Password" onChange={this.handleChange}/>
                            <Button disabled={loading} className={loading ? 'loading' : ''} color="violet" fluid
                                    size="large">Submit</Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    <Message>Don't have an account? <Link to="/register">Register</Link></Message>
                </Grid.Column>
            </Grid>
        );
    }
}

export default Login;
